/**
 * Created by Jeffers on 2/25/2017.
 */

let authenticator = module.exports = {
    /**
     * Verifies if User password matches
     * @param password: original password
     * @param conf_password: copy password
     * Returns: true if equal, else false
     */
    verify_password: function(password, conf_password) {
        return password === conf_password;
    },

    /**
     * Extracts a phone number from a given string
     * @param phone_number: given input string
     * @returns
     *      - a 10 digit phone number, if formatted correctly
     *      - null, if formatted incorrectly
     */
    parse_phoneNum: function (phone_number) {
        if (phone_number == null) {
            return phone_number;
        }
        let number = "";

        for (let idx = 0; idx < phone_number.length; idx++) {
            let curr_dig = phone_number.charAt(idx);
            // Verifies if current symbol is a number
            if (!isNaN(curr_dig)) {
                number += curr_dig;
            }
        }

        // Assures final phone number is valid, else it's null
        if (number.length != 10) {
            number = "";
        }

        return number;
    },

    /**
     * Verifies the User inputs an ucsd email
     * @param email: given User email
     * @returns true, if User enters a ucsd email
     *          false, if use didn't enter a ucsd email
     */
    verify_ucsd_email: function (email) {
        if (email == null) { return email; }

        let ucsd_edu = email.substring(email.length - 9);
        return ucsd_edu == "@ucsd.edu";
    },

    /**
     *  Verifies the User gave a ucsd email and matching password
     */
    isRegisterValid: function (email, password, conf_password) {
        // Assures given password and ucsd email is correct
        return !(!this.verify_password(password, conf_password) && this.verify_ucsd_email(email));
    }
};