
const knex = require('knex')({
    client: 'pg',
    version: '13.2',
    connection: {
      host : '127.0.0.1',
      user : 'postgres',
      password : 'cows',
      database : 'covey.town'
    }
  });


async function testQuery(){
    const result = await knex.select('*').from('test');
    console.log(result);
}

testQuery();