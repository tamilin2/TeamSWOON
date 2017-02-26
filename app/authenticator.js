/**
 * Created by Jeffers on 2/25/2017.
 */

var authenticator = module.exports = {
    /**
     * Verifies if user password matches
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
     * Verifies the user inputs an ucsd email
     * @param email: given user email
     * @returns true, if user enters a ucsd email
     *          false, if use didn't enter a ucsd email
     */
    verify_ucsd_email: function (email) {
        if (email == null) { return email; }

        let ucsd_edu = email.substring(email.length - 8);
        return ucsd_edu == "ucsd.edu";
    }
};

var require = function(path) {
    return module.exports;
};