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
    parse_phoneNum: function (req, res) {
        let phone_number = req.body.phone;
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
            req.flash('error_msg', 'Invalid phone number');
            res.redirect('/users/createUserProfile');
            return "";
        }

        return number;
    }
};