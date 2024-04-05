'use strict';
const mysql = require('mysql2')
const connection = mysql.createConnection(process.env.MUSHROMZ_CONNECTION_STRING)
const { 
  v4: uuidv4,
} = require('uuid');

async function getAllMushrooms() {
  return new Promise((resolve, reject) => {
    connection.execute(
      "SELECT * from mushromz WHERE deleted = 0",
      [],
      function (err, results, fields) {
          resolve(results);
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

async function storeMushroom(image, latitude, longitude, date) {
  return new Promise((resolve, reject) => {
    console.log(image);
    console.log(latitude);
    console.log(longitude);
    console.log(date);
    connection.execute(
      "INSERT INTO `mushromz` (`id`, `image`, `latitude`, `longitude`, `date`) VALUES (?,?,?,?,?)",
      [uuidv4(), image, latitude, longitude, date],
      function (err, results, fields) {
        if (err) {
          console.log(err);
        }
          resolve(results);
      }
    );
  });
}

module.exports.handler = async (event) => {
  let action = undefined;
  let body = undefined;

  try {
    body = JSON.parse(event.body);
    action = body.action;
  }
  catch(e) {

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

    await storeMushroom(body.image, body.latitude, body.longitude, body.date);

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

    const mushrooms = await getAllMushrooms();

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
