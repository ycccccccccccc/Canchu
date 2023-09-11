const create_DB = async (queryPromise) => {

    const CreateDB = `CREATE DATABASE IF NOT EXISTS canchu_test;`;
    let result = await queryPromise(CreateDB, []);

    const CopyTable = `
        USE canchu_test;
        CREATE TABLE IF NOT EXISTS canchu_test.user LIKE canchu.user;
        CREATE TABLE IF NOT EXISTS canchu_test.friendship LIKE canchu.friendship;
        CREATE TABLE IF NOT EXISTS canchu_test.event LIKE canchu.event;
        CREATE TABLE IF NOT EXISTS canchu_test.post LIKE canchu.post;
        CREATE TABLE IF NOT EXISTS canchu_test.comment LIKE canchu.comment;
        CREATE TABLE IF NOT EXISTS canchu_test.like_table LIKE canchu.like_table;
        CREATE TABLE IF NOT EXISTS canchu_test.group_table LIKE canchu.group_table;
        CREATE TABLE IF NOT EXISTS canchu_test.member LIKE canchu.member;
        CREATE TABLE IF NOT EXISTS canchu_test.group_post LIKE canchu.group_post;
        CREATE TABLE IF NOT EXISTS canchu_test.chat LIKE canchu.chat;
    `;
    result = await queryPromise(CopyTable, []);
}

module.exports = {
    create_DB
}