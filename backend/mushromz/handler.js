'use strict';
const mysql = require('mysql2')
const connection = mysql.createConnection(process.env.MUSHROMZ_CONNECTION_STRING)
const {
  v4: uuidv4,
} = require('uuid');

const jwt = require('jsonwebtoken');

const CLERK_PEM_PUBLIC_KEY = process.env.CLERK_PEM_PUBLIC_KEY;

const CLERK_PUBLIC_KEY = `
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA5+OGKXqh774yM8YIg/gw
i1WRFfLDyNvkZnUqdM6JdGJHj7rChIcmHeXcqNoDYtkO90YhCzccE11veUX+jnir
BO6Emq5uoFtfHl8vz7mVjL6Hr5BDXnSF01feqPyfe9SeDKJOmDAt0W/U6fGSVUr7
DooETQjAEUwJLuC/jWJbU4fVkBtDAnmybe66IYJec7uzo4zw77BMwOmJxTlsYo5q
BT4BHll7dJ6AjLvpBq/MDrBDqiUU5ScLzEahZnGCjDeK9JZ9MbsPdfHCiVrTVhp8
oXj9raIbOehXayayeKBVCtdmYqk2g0ukleFyYXtNUaUNCpM2L8kZyA6c44nB3Uts
GQIDAQAB
-----END PUBLIC KEY-----
`;

async function getAllMushrooms(uid) {
  return new Promise((resolve, reject) => {
    connection.execute(
      "SELECT * from mushromz WHERE deleted = 0 AND uid = ?",
      [uid],
      function (err, results, fields) {
        resolve(results);
      }
    );
  });
}

async function getMushroom(mushroomID) {
  return new Promise((resolve, reject) => {
    connection.execute(
      "SELECT * from mushromz WHERE deleted = 0 AND id = ?",
      [mushroomID],
      function (err, results, fields) {
        resolve(results[0]);
      }
    );
  });
}

async function deleteMushroom(id) {
  return new Promise((resolve, reject) => {
    connection.execute(
      "UPDATE `mushromz` SET `deleted`='1' WHERE (`mushromz`.`id` = ?)",
      [id],
      function (err, results, fields) {
        if (err) {
          console.log(err);
        }
        resolve(results);
      }
    );
  });
}

async function storeMushroom(uid, image, latitude, longitude, date) {
  return new Promise((resolve, reject) => {
    console.log(image);
    console.log(latitude);
    console.log(longitude);
    console.log(date);
    connection.execute(
      "INSERT INTO `mushromz` (`uid`, `id`, `image`, `latitude`, `longitude`, `date`) VALUES (?,?,?,?,?,?)",
      [uid, uuidv4(), image, latitude, longitude, date],
      function (err, results, fields) {
        if (err) {
          console.log(err);
        }
        resolve(results);
      }
    );
  });
}

async function verifyRequest(event) {
  console.log('handling authentication');

  const token = event.queryStringParameters.token;

  let safeToken = false;
  let decodedToken = undefined;
  let sub = undefined;

  try {
    decodedToken = jwt.verify(token, CLERK_PUBLIC_KEY);
    safeToken = true;
    sub = decodedToken.sub;
  }
  catch (e) {
    safeToken = false;
    console.log(e);
  }

  console.log('identifier user ' + sub);

  return sub;
}

module.exports.handler = async (event) => {
  let action = undefined;
  let body = undefined;

  const uid = await verifyRequest(event);

  if (uid === undefined || uid === null || uid === '') {
    return {
      statusCode: 401,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Headers': '*'
      },
      body: JSON.stringify({
        noauth: true
      })
    }
  }

  try {
    body = JSON.parse(event.body);
    action = body.action;
  }
  catch (e) {
    action = event.queryStringParameters.action;
  }

  if (action === 'download') {
    const mushroom = await getMushroom(event.queryStringParameters.id);
    
    var dataUrl = mushroom.image;
    var dataUrlEdit = dataUrl.replace(/data:image\/jpeg;base64,/, '');
    var img = Buffer.from(dataUrlEdit, 'base64');
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'image/jpeg',
      },
      isBase64Encoded: true,
      body: img.toString('base64')
    }
  }

  if (action === 'delete') {
    console.log("marking mushroom as deleted");

    await deleteMushroom(body.id);

    console.log('done');

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Headers': '*'
      },
      body: JSON.stringify({
        status: 'done'
      })
    }
  }

  if (action === 'add') {
    console.log("handling as submission");

    await storeMushroom(uid, body.image, body.latitude, body.longitude, body.date);

    console.log('stored');

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Headers': '*'
      },
      body: JSON.stringify({
        status: 'done'
      })
    }
  }
  else {
    console.log("handling as retrieval");

    const mushrooms = await getAllMushrooms(uid);

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Headers': '*'
      },
      body: JSON.stringify(mushrooms)
    }
  }
};
