CREATE DATABASE IF NOT EXISTS canchu;
CREATE DATABASE IF NOT EXISTS canchu_test;
USE canchu;
SET GLOBAL time_zone = '+8:00';
SET time_zone = '+8:00';

CREATE TABLE IF NOT EXISTS user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    provider VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    picture VARCHAR(255),
    password VARCHAR(255) NOT NULL,
    introduction VARCHAR(255),
    tags VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS friendship (
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_1 INT NOT NULL,
    id_2 INT NOT NULL,
    status VARCHAR(255) NOT NULL,
    CONSTRAINT id_1_key FOREIGN KEY (id_1) REFERENCES user(id) ON DELETE CASCADE,
    CONSTRAINT id_2_key FOREIGN KEY (id_2) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS event (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    type VARCHAR(255) NOT NULL,
    image VARCHAR(255) ,
    summary VARCHAR(255),
    is_read BOOL NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT user_id_key FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS post (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    context TEXT NOT NULL,
    like_count INT NOT NULL DEFAULT 0,
    comment_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT post_user_id_key FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS comment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    comment TEXT NOT NULL, 
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT comment_user_id_key FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    CONSTRAINT comment_post_id_key FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS like_table (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    post_id INT NOT NULL,
    CONSTRAINT like_user_id_key FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    CONSTRAINT like_post_id_key FOREIGN KEY (post_id) REFERENCES post(id) ON DELETE CASCADE,
    UNIQUE INDEX idx_unique_like (user_id, post_id)
);

CREATE TABLE IF NOT EXISTS group_table (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    CONSTRAINT group_user_id_key FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS member (
    id INT PRIMARY KEY AUTO_INCREMENT,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    identity VARCHAR(255) NOT NULL,
    CONSTRAINT member_group_id_key FOREIGN KEY (group_id) REFERENCES group_table(id) ON DELETE CASCADE,
    CONSTRAINT number_user_id_key FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE,
    UNIQUE INDEX unique_group_user (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS group_post (
    id INT PRIMARY KEY AUTO_INCREMENT,
    group_id INT NOT NULL,
    user_id INT NOT NULL,
    context TEXT NOT NULL,
    like_count INT NOT NULL DEFAULT 0,
    comment_count INT NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT group_post_group_id_key FOREIGN KEY (group_id) REFERENCES group_table(id) ON DELETE CASCADE,
    CONSTRAINT group_post_user_id_key FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS chat (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    recipient_id INT NOT NULL,
    message TEXT NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chat_sender_id_key FOREIGN KEY (sender_id) REFERENCES user(id) ON DELETE CASCADE,
    CONSTRAINT chat_recipient_id_key FOREIGN KEY (recipient_id) REFERENCES user(id) ON DELETE CASCADE
);
