import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Helper class
 */
export default class Helper {
  /**
   * Method to exclude properties from an object
   * @param {object} objectItem - The object to exclude fields from
   * @param {array} fields - Array of fields to be removed
   * @returns {object} - new object
   */
  static omitFields(objectItem, fields) {
    const items = objectItem;

    fields.forEach((field) => {
      delete items[field];
    });

    return items;
  }

  /**
   * Method to exclude properties from an object
   * @param {object} objectItem - The object to extract fields from
   * @param {array} fields - Array of fields to be extracted
   * @returns {object} - new object
   */
  static pickFields(objectItem, fields) {
    const items = {};

    fields.forEach((field) => {
      items[field] = objectItem[field];
    });

    return items;
  }

  /**
   * Method encrypt data
   * @param {string} password - password to encrypt
   * @param { number } rounds - salt value
   * @returns { string} - encypted data
   */
  static async encryptor(password, rounds = 10) {
    const salt = await bcrypt.genSaltSync(rounds);
    const encrypted = await bcrypt.hashSync(password, salt);

    return encrypted;
  }

  /**
   * Method generate token
   * @param {object} payloader - data
   * @returns {string} - token
   */
  static genToken(payloader) {
    const secret = process.env.JWTSECRET;
    const token = jwt.sign(payloader, secret, { expiresIn: '1hr' });

    return token;
  }

  /**
   * Method generate token
   * @param {object} profile -user social profile
   * @returns {object} - user details
   */
  static getUserSocialDetails(profile) {
    const { provider, _json: data } = profile;
    const user = { password: crypto.randomBytes(15).toString('hex') };

    if (provider === 'google') {
      user.email = data.email;
      user.image = data.picture;
      user.socialId = data.sub;
      user.firstName = data.given_name;
      user.lastName = data.family_name;
    } else {
      user.socialId = data.id;
      user.email = data.email;
      user.firstName = data.first_name;
      user.lastName = data.last_name;
      user.middleName = data.middle_name;
      user.image = data.picture.data.url;
    }
    return user;
  }

  /**
   * Method authenticate token
   * @param {string} token - token
   * @returns {string} - user details
   */
  static verifyToken(token) {
    const verify = jwt.verify(token, process.env.JWTSECRET, (err, decoded) => decoded);

    return verify;
  }
}
