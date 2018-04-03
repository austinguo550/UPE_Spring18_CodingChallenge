const base_url = ".";   // change to heroku later
const mongo = base_url + "/mongo"


async function update_token(email) {
    if (email !== undefined && email !== "") {
        const response = await fetch(mongo + "/update_token", {
            method: 'POST',
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: email
            }),
        });
        
        if (response.status >= 200 && response.status < 300) {
            const text = await response.json();
            console.log(text);
            display_token.innerHTML = text.token;
        } else {
            console.log("Error creating token");
            display_token.innerHTML = "Error creating token";
        }
    }
    else {
        console.log("Could not find email");
        display_token.innerHTML = "Could not find email";
    }
}

window.onload = function() {
    

    document.getElementById('create_token').addEventListener('click',
        function() {
            let email = document.getElementById('email_address').value;
            console.log(email);
            let display_token = document.getElementById('display_token');

            // going to have to add a request to get the valid emails from backend later to check if email is valid
            // populate valid_emails ...
            update_token(email);
        });
     }