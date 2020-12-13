-- --------------------------------------------------------
-- Hôte :                        127.0.0.1
-- Version du serveur:           10.4.12-MariaDB - mariadb.org binary distribution
-- SE du serveur:                Win64
-- HeidiSQL Version:             11.0.0.5919
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

-- Listage de la structure de la table parsify_db. domains
CREATE TABLE IF NOT EXISTS `domains` (
  `domainName` varchar(100) PRIMARY KEY,
  `dateRegistration` date DEFAULT NULL,
  `lastTimeCheckedDate` date DEFAULT NULL,
  `isShopify` tinyint(4) DEFAULT NULL,
  `numberChecked` int(11) DEFAULT NULL,
  `zone` varchar(10) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=158530 DEFAULT CHARSET=utf8;

CREATE TABLE IF NOT EXISTS `users` (
  `email` varchar(100) NOT NULL DEFAULT '',
  `password` varchar(100) NOT NULL DEFAULT '',
  `createdAt` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `facebook_page` (
	`id` int PRIMARY KEY NOT NULL AUTO_INCREMENT,
	`pageName` VARCHAR(100),
	`pageLink` VARCHAR(150),
	`domainName` VARCHAR(100),
	FOREIGN KEY (`domainName`) REFERENCES `domains` (`domainName`)
	
)ENGINE=InnoDB DEFAULT CHARSET=utf8;

CREATE TABLE `file_infos` (
	`filePath` VARCHAR(100) NOT NULL DEFAULT '',
	`linesCount` INT NOT NULL DEFAULT 0,
	`parsedCount` INT NOT NULL DEFAULT 0,
	 `zone` varchar(10) DEFAULT NULL,
	PRIMARY KEY (`filePath`)
)

CREATE TABLE `user_domains_favorites` (
	`domainName` VARCHAR(100) NOT NULL DEFAULT '',
	`login` VARCHAR(100) NOT NULL DEFAULT '',
	PRIMARY KEY (`domainName`, `login`),
	CONSTRAINT `FK_USER` FOREIGN KEY (`login`) REFERENCES `users` (`email`),
	CONSTRAINT `FK_DOMAINS` FOREIGN KEY (`domainName`) REFERENCES `domains` (`domainName`)
)


-- Les données exportées n'étaient pas sélectionnées.

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IF(@OLD_FOREIGN_KEY_CHECKS IS NULL, 1, @OLD_FOREIGN_KEY_CHECKS) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
