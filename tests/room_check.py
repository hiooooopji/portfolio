"""Browser checks for the interactive 3D workshop; run with npm run dev active."""
import json
import sys
from pathlib import Path
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.common.action_chains import ActionChains
from selenium.webdriver.support.ui import WebDriverWait, Select

out=Path('/tmp/midnight-workshop-3d-qa');out.mkdir(exist_ok=True)
options=webdriver.ChromeOptions();options.binary_location='/usr/bin/chromium'
for flag in ['--headless=new','--no-sandbox','--disable-dev-shm-usage','--window-size=1440,1000','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']:
    options.add_argument(flag)
options.set_capability('goog:loggingPrefs',{'browser':'ALL'})
driver=webdriver.Chrome(service=Service('/usr/bin/chromedriver'),options=options)
wait=WebDriverWait(driver,60);checks=[]
def el(id):return driver.find_element(By.ID,id)
def css(selector):return driver.find_element(By.CSS_SELECTOR,selector)
def check(name,condition):
    assert condition,name
    checks.append(name);print('PASS:',name,flush=True)
def settled(view):
    wait.until(lambda d:el('workshop-view').get_attribute('data-view')==view and el('workshop-view').get_attribute('data-moving')=='false')
def focus(view):
    css(f'.world-dock [data-world-target="{view}"]').click();settled(view)
def shot(name):driver.save_screenshot(str(out/name))
def ready():wait.until(lambda d:'Your turn' in el('game-status').text or 'got it' in el('game-status').text or 'takes this' in el('game-status').text)
try:
    driver.get('http://127.0.0.1:4173/');wait.until(lambda d:len(d.find_elements(By.CSS_SELECTOR,'.slot'))==42)
    el('enter-workshop').click();settled('overview')
    check('enter opens actual WebGL room',el('workshop-view').get_attribute('open') is not None and bool(driver.find_elements(By.CSS_SELECTOR,'#world-layer canvas')))
    check('loading completes without fallback',not el('room-loading').is_displayed() and not el('room-error').is_displayed())
    if '--visual-only' in sys.argv:
        label=css('#world-labels [data-world-target="notebook"]').rect
        canvas=css('#world-layer canvas');rect=canvas.rect
        ActionChains(driver).move_to_element_with_offset(canvas,label['x']+label['width']/2+20-rect['width']/2,label['y']+label['height']+11-rect['height']/2).click().perform()
        settled('notebook');check('physical notebook opens when clicked',css('.notebook-ui').is_displayed())
        focus('overview')
        driver.execute_cdp_cmd('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True});settled('overview');shot('07-room-mobile.png')
        focus('game');css('#room-game-controls input[value="best"]+span').click();Select(el('first-player')).select_by_value('bot');el('start-game').click();ready();shot('08-game-mobile.png')
        check('mobile board plays after visual refinements',len(driver.find_elements(By.CSS_SELECTOR,'.disc.bot'))==1)
        errors=[e for e in driver.get_log('browser') if e['level']=='SEVERE'];check('no errors after final changes',not errors)
        (out/'results-final.json').write_text(json.dumps({'checks':checks,'errors':errors},indent=2))
        raise SystemExit(0)
    shot('01-room-desktop.png')
    if '--game-only' not in sys.argv:
        # Select the physical monitor beneath its projected label, not a menu button.
        label=css('#world-labels [data-world-target="monitor"]').rect
        x,y=label['x']+label['width']/2,label['y']+label['height']+65
        ActionChains(driver).move_by_offset(x,y).click().perform();ActionChains(driver).move_by_offset(-x,-y).perform()
        settled('monitor')
        check('clicking monitor geometry moves camera to projects',css('.monitor-ui').is_displayed())
        check('monitor contains projects only',not el('room-game-controls').is_displayed() and not any(x.is_displayed() for x in driver.find_elements(By.CSS_SELECTOR,'.notebook-ui')))
        shot('02-monitor-desktop.png')
        css('[data-project="1"]').click();check('monitor tabs browse real projects','A world.' in css('.monitor-content').text)
        css('[data-project="4"]').click();check('repository drawer available inside monitor',len(driver.find_elements(By.CSS_SELECTOR,'.monitor-ui .repo-link'))==11)
        focus('notebook');shot('03-notebook-desktop.png')
        check('notebook opens at the same physical desk',css('.notebook-ui').is_displayed() and not css('.monitor-ui').is_displayed())
        el('notebook-next').click();check('notebook pages turn','02 / 03' in el('notebook-page').text)
        css('[data-page="2"]').click();wait.until(lambda d:'page-turn' not in css('.notebook-ui').get_attribute('class'))
        canvas=el('notebook-doodle');ActionChains(driver).move_to_element(canvas).click_and_hold().move_by_offset(50,15).move_by_offset(20,-25).release().perform()
        check('drawing saves locally',driver.execute_script("return !!localStorage.getItem('midnight-workshop:doodle')"))
        shot('04-notebook-doodle.png')
        el('doodle-clear').click();check('doodle can be cleared',driver.execute_script("return [...document.getElementById('notebook-doodle').getContext('2d').getImageData(0,0,600,360).data].every(x=>x===0)"))
    focus('game');check('game controls move into 3D view',bool(driver.find_elements(By.CSS_SELECTOR,'#room-game-controls #start-game')))
    el('start-game').click();ready()
    shot('05-game-desktop.png')
    column=css('#room-column-controls [data-column="0"]').rect
    canvas=css('#world-layer canvas');rect=canvas.rect
    ActionChains(driver).move_to_element_with_offset(canvas,column['x']+column['width']/2-rect['width']/2,column['y']+150-rect['height']/2).click().perform();ready()
    check('physical board accepts raycast moves',len(driver.find_elements(By.CSS_SELECTOR,'.disc.human'))==1)
    for c in range(1,4):css(f'#room-column-controls [data-column="{c}"]').click();ready()
    check('3D Connect X plays with original Worst Bot','got it' in el('game-status').text)
    check('3D game updates shared score',el('human-score').text=='1')
    shot('06-game-win.png')
    css('#room-game-controls input[value="best"]+span').click();Select(el('first-player')).select_by_value('bot')
    el('start-game').click();ready();check('original Best Bot plays in 3D',len(driver.find_elements(By.CSS_SELECTOR,'.disc.bot'))==1)
    focus('overview');check('back restores original page controls',bool(driver.find_elements(By.CSS_SELECTOR,'#play #start-game')))
    # Portrait camera framing and interaction surfaces.
    driver.execute_cdp_cmd('Emulation.setDeviceMetricsOverride',{'width':390,'height':844,'deviceScaleFactor':1,'mobile':True});settled('overview');shot('07-room-mobile.png')
    for view in ['monitor','notebook','game']:
        focus(view);shot(f'08-{view}-mobile.png')
        check(f'{view} mobile view opens',el('workshop-view').get_attribute('data-view')==view)
        if view=='notebook':css('[data-page="0"]').click()
    el('room-back').click();settled('overview');el('room-exit').click()
    check('exit restores normal portfolio',not el('workshop-view').is_displayed() and bool(driver.find_elements(By.CSS_SELECTOR,'#play #start-game')))
    css('.hotspot-game').click();settled('game');check('landing game hotspot enters 3D board directly',el('room-game-controls').is_displayed())
    errors=[e for e in driver.get_log('browser') if e['level']=='SEVERE']
    check('no browser JavaScript errors',not errors)
    (out/('results-game.json' if '--game-only' in sys.argv else 'results.json')).write_text(json.dumps({'checks':checks,'errors':errors},indent=2))
except Exception:
    shot('failure.png');print('ROOM:',el('workshop-view').get_attribute('data-view'),flush=True);print('BROWSER:',driver.get_log('browser'),flush=True);raise
finally:driver.quit()
