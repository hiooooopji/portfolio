"""Optional full browser integration checks. Requires Selenium + Chromium."""
import base64
import json
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select

out = Path('/tmp/midnight-workshop-qa'); out.mkdir(exist_ok=True)
options = webdriver.ChromeOptions()
options.binary_location = '/usr/bin/chromium'
for flag in ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--window-size=1440,1000']:
    options.add_argument(flag)
options.set_capability('goog:loggingPrefs', {'browser': 'ALL'})
driver = webdriver.Chrome(service=Service('/usr/bin/chromedriver'), options=options)
wait = WebDriverWait(driver, 60)
checks = []
def check(name, condition):
    assert condition, name
    checks.append(name); print('PASS:', name, flush=True)
def el(id): return driver.find_element(By.ID, id)
def click(element):
    driver.execute_script("arguments[0].scrollIntoView({block:'center',behavior:'instant'})", element)
    element.click()
def ready():
    wait.until(lambda d: 'Your turn' in el('game-status').text or 'got it' in el('game-status').text or 'takes this' in el('game-status').text or 'draw' in el('game-status').text)
def full_screenshot(name):
    metrics = driver.execute_cdp_cmd('Page.getLayoutMetrics', {})
    size = metrics['cssContentSize']
    result = driver.execute_cdp_cmd('Page.captureScreenshot', {'format': 'png', 'captureBeyondViewport': True, 'clip': {'x': 0, 'y': 0, 'width': size['width'], 'height': size['height'], 'scale': 1}})
    (out/name).write_bytes(base64.b64decode(result['data']))
try:
    driver.get('http://127.0.0.1:4173/')
    wait.until(lambda d: len(d.find_elements(By.CSS_SELECTOR, '.slot')) == 42)
    driver.execute_async_script('document.fonts.ready.then(arguments[0])')
    driver.execute_script("document.documentElement.style.scrollBehavior='auto'")
    check('all local images loaded', driver.execute_script('return [...document.images].every(i=>i.complete&&i.naturalWidth>0)'))
    check('custom fonts loaded', driver.execute_script("return document.fonts.check('16px \"Workshop Serif\"') && document.fonts.check('16px \"Workshop Sans\"')"))
    check('no desktop horizontal overflow', driver.execute_script('return document.documentElement.scrollWidth<=innerWidth'))
    driver.save_screenshot(str(out/'desktop.png')); full_screenshot('desktop-full.png')
    click(driver.find_element(By.CSS_SELECTOR, '.hero-actions a[href="#work"]'))
    check('projects open on the regular page', not el('workshop-view').is_displayed() and driver.execute_script('return location.hash') == '#work')
    click(driver.find_element(By.CSS_SELECTOR, '#play .game-story-link'))
    check('game build notes open without entering 3D', el('connect-story').get_attribute('open') is not None and not el('workshop-view').is_displayed())
    click(driver.find_element(By.CSS_SELECTOR, '#connect-story > summary'))
    click(el('lamp-toggle')); check('lamp dims', 'lamp-dimmed' in el('room-stage').get_attribute('class')); click(el('lamp-toggle'))
    click(el('sound-toggle')); check('calm music toggles on', el('sound-toggle').get_attribute('aria-pressed') == 'true' and el('sound-label').text == 'Music on'); click(el('sound-toggle'))
    click(driver.find_element(By.CSS_SELECTOR, '#experiments summary'))
    check('all 12 public repositories represented', len(driver.find_elements(By.CSS_SELECTOR, '.repo-link')) == 11 and bool(driver.find_elements(By.CSS_SELECTOR, 'a[href="https://github.com/hiooooopji/botas"]')))
    click(driver.find_element(By.CSS_SELECTOR, '#experiments summary'))
    click(el('start-game')); ready()
    check('original Python runtime starts in browser', 'Your turn' in el('game-status').text)
    for c in range(4):
        column = driver.find_element(By.CSS_SELECTOR, f'.board-column[data-column="{c}"]')
        if column.is_enabled(): click(column); ready()
        if 'got it' in el('game-status').text: break
    check('human can beat Worst Bot', 'got it' in el('game-status').text)
    check('win highlights and score', len(driver.find_elements(By.CSS_SELECTOR, '.slot.winner')) >= 4 and el('human-score').text == '1')
    check('terminal game disables all columns', not any(x.is_enabled() for x in driver.find_elements(By.CSS_SELECTOR, '.board-column')))
    driver.save_screenshot(str(out/'game-win.png'))
    click(driver.find_element(By.CSS_SELECTOR, 'input[value="best"] + span'))
    Select(el('first-player')).select_by_value('bot')
    click(el('start-game')); ready()
    check('Best Bot uses center opening as first player', bool(driver.find_elements(By.CSS_SELECTOR, '.board-column[data-column="3"] .disc.bot')))
    click(driver.find_element(By.CSS_SELECTOR, '.board-column[data-column="2"]')); ready()
    check('Best Bot responds with a legal move', len(driver.find_elements(By.CSS_SELECTOR, '.disc')) == 3)
    for target in ['3', '5']:
        Select(el('connect-target')).select_by_value(target)
        Select(el('first-player')).select_by_value('human')
        click(el('start-game')); ready()
        click(driver.find_element(By.CSS_SELECTOR, '.board-column[data-column="3"]')); ready()
        check(f'Connect {target} playable', el('game-title-x').text == target and len(driver.find_elements(By.CSS_SELECTOR, '.disc')) == 2)
    # Reset while an old reply is in flight; it must never leak into a new board.
    click(driver.find_element(By.CSS_SELECTOR, '.board-column[data-column="2"]'))
    click(el('start-game')); ready()
    check('restart discards previous game moves', len(driver.find_elements(By.CSS_SELECTOR, '.disc')) == 0)
    first = driver.find_element(By.CSS_SELECTOR, '.board-column[data-column="0"]'); first.send_keys('\ue014')
    check('keyboard can move between columns', driver.switch_to.active_element.get_attribute('data-column') == '1')
    driver.execute_cdp_cmd('Emulation.setDeviceMetricsOverride', {'width': 390, 'height': 844, 'deviceScaleFactor': 1, 'mobile': True})
    driver.execute_script('window.scrollTo(0,0)')
    check('no mobile horizontal overflow', driver.execute_script('return document.documentElement.scrollWidth<=innerWidth'))
    check('all four project shortcuts stay visible on mobile', len([link for link in driver.find_elements(By.CSS_SELECTOR, '.project-index a') if link.is_displayed()]) == 4)
    driver.save_screenshot(str(out/'mobile.png')); full_screenshot('mobile-full.png')
    driver.execute_script("document.getElementById('play').scrollIntoView({behavior:'instant'})")
    check('page game remains available alongside 3D room', el('board').is_displayed())
    driver.save_screenshot(str(out/'mobile-game.png'))
    for width in [320, 768, 1024]:
        driver.execute_cdp_cmd('Emulation.setDeviceMetricsOverride', {'width': width, 'height': 900, 'deviceScaleFactor': 1, 'mobile': width<740})
        check(f'no overflow at {width}px', driver.execute_script('return document.documentElement.scrollWidth<=innerWidth'))
    errors = [entry for entry in driver.get_log('browser') if entry['level'] == 'SEVERE']
    check('no browser errors', not errors)
    (out/'results.json').write_text(json.dumps({'checks': checks, 'errors': errors}, indent=2))
    print('Screenshots:', out, flush=True)
except Exception:
    driver.save_screenshot(str(out/'failure.png'))
    print('STATUS:', el('game-status').text, flush=True)
    print('BROWSER LOG:', driver.get_log('browser'), flush=True)
    raise
finally:
    driver.quit()
