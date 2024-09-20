from time import sleep
from selenium import webdriver

from selenium.webdriver.common.keys import Keys
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By


# Create a new instance of the Chrome driver

driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))



# Open the Python website

driver.get("https://www.python.org")



# Print the page title

print(driver.title)



# Find the search bar using its name attribute

search_bar = driver.find_element(By.NAME, "q")

search_bar.clear()

search_bar.send_keys("getting started with python")

search_bar.send_keys(Keys.RETURN)

# Print the current URL

print(driver.current_url)


sleep(5)


# Close the browser window

driver.close()