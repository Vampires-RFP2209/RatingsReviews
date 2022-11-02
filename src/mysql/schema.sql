CREATE DATABASE IF NOT EXISTS ratings_reviews;
USE ratings_reviews;

CREATE TABLE IF NOT EXISTS reviews (
  id INT PRIMARY KEY AUTO_INCREMENT,
  rating INT NOT NULL,
  summary VARCHAR(60),
  recommend BOOLEAN NOT NULL,
  body VARCHAR(1000) NOT NULL,
  reviewer_name VARCHAR(60) NOT NULL,
  reviewer_email VARCHAR(60) NOT NULL,
  product_id INT NOT NULL,
  helpfulness INT DEFAULT 0,
  reported BOOLEAN DEFAULT 0,
  date DATE DEFAULT (CURRENT_DATE),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS photos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  url TEXT NOT NULL,
  review_id INT NOT NULL,
  FOREIGN KEY (review_id) REFERENCES reviews(id)
);

CREATE TABLE IF NOT EXISTS characteristic_names (
  id INT PRIMARY KEY AUTO_INCREMENT,
  characterisic TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS characteristics (
  id INT PRIMARY KEY AUTO_INCREMENT,
  product_id INT NOT NULL,
  characteristic_name_id INT NOT NULL,
  FOREIGN KEY (characteristic_name_id) REFERENCES characteristic_names(id)
);

CREATE TABLE IF NOT EXISTS characteristic_values (
  id INT PRIMARY KEY AUTO_INCREMENT,
  `value` INT NOT NULL,
  review_id INT NOT NULL,
  characterisic_id INT NOT NULL,
  FOREIGN KEY (review_id) REFERENCES reviews(id),
  FOREIGN KEY (characterisic_id) REFERENCES characteristics(id)
);