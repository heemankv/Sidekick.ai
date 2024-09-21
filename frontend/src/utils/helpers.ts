
const backendURL = "http://localhost:8000";

async function sendUserID(userWorldId : String) : Promise<String> {
  console.log("sending user id", userWorldId) 
  // here's a post call to backendURL

  const response = await fetch(`${backendURL}/user`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify({ "world_coin_id" : userWorldId }),
  });

  if (!response.ok) {
    throw new Error('Failed to send user ID');
  }

  const data = await response.json();
  return data;
}


// profile
// address
// family

async function sendPrompt( user_id : String,prompt_type: String, prompt: String) : Promise<String> {
  // here's a post call to backendURL

  // ```
  //   curl --location 'localhost:8000/prompt' \
  // --header 'Content-Type: application/json' \
  // --data-raw '{
  //     "user_id": "caf9d3d6-a139-4e8e-a20b-5e7802608d36",
  //     "prompt_type": "profile",
  //     "prompt": "I am anukkrit shanker, 19/09/1999, my email is anukkrit.aa@gmai.com, phone is 9219191919"
  // }
  //   ```

  const response = await fetch(`${backendURL}/prompt`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ "user_id": user_id, "prompt_type": prompt_type, "prompt": prompt }),
  });

  if (!response.ok) {
    throw new Error('Failed to send prompt');
  }

  const data = await response.json();
  return data;
}


export { sendUserID, sendPrompt };