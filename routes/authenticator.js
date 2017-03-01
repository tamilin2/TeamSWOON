/**
 * Created by Jeffers on 2/25/2017.
 * Authenticate user's input to databaes
 */

let authenticator = module.exports = {
    /**
     * Extracts a phone number from a given string
     * @param phone_number: given input string
     * @returns
     *      - true, if formatted correctly
     *      - false, if formatted incorrectly
     */
    parse_phoneNum: function (phone_number) {
        let number = "";

        for (let idx = 0; idx < phone_number.length; idx++) {
            let curr_dig = phone_number.charAt(idx);
            // Verifies if current symbol is a number
            if (!isNaN(curr_dig)) {
                number += curr_dig;
            }
        }
        return number;
    },

    /**
     * verifies given phone number is valid
     */
    verify_phone: function (req, res, phone) {
        // Assures final phone number is valid
        if (phone.length == 10) {
            return true;
        }
        console.log("Bad phone");
        req.flash('errorMsg', 'Invalid phone number');
        return false;
    },

    /**
     * Verifies given email is a ucsd.edu email
     */
    verify_email: function (req, res, email) {
        // Assures email address ends in @ucsd.edu to be a ucsd email
        if(email.substring(email.length-9) === '@ucsd.edu') {
            return true;
        }
        console.log("Bad email");
        req.flash('errorMsg', 'Invalid ucsd email');
        return false;
    },

    capitalize_name : function (name) {
        return name.charAt(0).toUpperCase() + name.slice(1);
    }
};