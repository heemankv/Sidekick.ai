from time import sleep
from selenium import webdriver

from selenium.webdriver.common.keys import Keys
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By





def application_information(driver):

  json = {
     "l_name_end" : "Kumar",
     "f_name_end" : "Rajesh",
     "m_name_end" : "Kumar",
     "date_of_birth_reg" : "29/01/2002",
     "gender_end" : "Male",
     "aadhar_end" : "123456789012",
     "pan_end" : "ABCDE1234F",
     "email_end" : "rajesh@gmail.com",
     "mobile_end" : "1234567890",
     "address_end" : "1234567890",
  }
    
  # Last name :
  driver.find_element(By.ID, "l_name_end").send_keys(json["l_name_end"])

  # First name :
  driver.find_element(By.ID, "f_name_end").send_keys(json["f_name_end"])

  # Middle name :
  driver.find_element(By.ID, "m_name_end").send_keys(json["m_name_end"])

  # Date of birth : Type : DD/MM/YYYY
  driver.find_element(By.ID, "date_of_birth_reg").send_keys(json["date_of_birth_reg"])
  # this opens a dropdown calendar, close that
  driver.find_element(By.CLASS_NAME, "show-calendar").click()

  # Email : 
  driver.find_element(By.ID, "email_id2").send_keys(json["email_end"])

  # Mobile :
  driver.find_element(By.ID, "rvContactNo").send_keys(json["mobile_end"])

  # allow the concent : 
  # consent is a checkbox with name consent
  driver.find_element(By.NAME, "consent").click()

  # how to validate the captcha ?
  # captcha is a div with class captcha-container
  # click on it to close the captcha
  driver.find_element(By.CLASS_NAME, "captcha-container").click()





def main():
    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    driver.get("https://www.onlineservices.nsdl.com/paam/endUserRegisterContact.html")
    sleep(1)

    application_information(driver)
    # fill_application_Category(driver)
    sleep(5)



    driver.quit()

if __name__ == "__main__":
    main()