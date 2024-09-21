from selenium.webdriver.common.by import By
from selenium import webdriver
from selenium.webdriver.support.ui import Select

# Helper functions
def fill_radio_button(driver, id) :
    radio_button = driver.find_element(By.ID, id)
    radio_button.click()

def fill_input_field(driver, id, value) :
    input_field = driver.find_element(By.ID, id)
    input_field.send_keys(value)

def fill_option_field(driver, id_of_select, value) :
    # choose from multiple options and select the option who's value matches the value passed
    # Locate the dropdown element
    dropdown = Select(driver.find_element(By.ID, id_of_select))
    # Select the option with the matching value
    dropdown.select_by_value(value)

def fill_checkbox(driver, id) :
    checkbox = driver.find_element(By.ID, id)
    checkbox.click()

def fill_dropdown(driver, id, value) :
    dropdown = driver.find_element(By.ID, id)
    dropdown.send_keys(value)

def fill_date_picker(driver, id, value) :
    date_picker = driver.find_element(By.ID, id)
    date_picker.send_keys(value)

def fill_file_upload(driver, id, value) :
    file_upload = driver.find_element(By.ID, id)
    file_upload.send_keys(value)

def fill_submit_button(driver, id, value) :
    submit_button = driver.find_element(By.ID, id)
    submit_button.click()

