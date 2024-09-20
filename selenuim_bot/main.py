from time import sleep
from selenium import webdriver

from selenium.webdriver.common.keys import Keys
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By
from helpers import *




# website url : https://india-pan.netlify.app
def get_website_driver() :
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    driver.get("https://india-pan.netlify.app")
    return driver


def main() :
    
    website_driver = get_website_driver()

    # fill Whether citizen of India
    fill_radio_button(website_driver, "indian-citizen-yes")
    
    sleep(10)
    # run


if __name__ == "__main__" :
    main()