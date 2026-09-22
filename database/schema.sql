-- ============================================================
--  MONIFY DATABASE – Schema v1.0
--  Base de données pour commerçants africains (FCFA / XAF)
-- ============================================================

-- Création de la base de données
CREATE DATABASE IF NOT EXISTS monify_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE monify_db;

-- ============================================================
-- TABLE : utilisateurs
-- (Complétée en Phase 1 – Authentification)
-- ============================================================
CREATE TABLE IF NOT EXISTS utilisateurs (
  id            INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  nom_complet   VARCHAR(150)      NOT NULL,
  nom_commerce  VARCHAR(200)      NOT NULL,
  type_activite VARCHAR(100)      DEFAULT NULL,
  email         VARCHAR(255)      NOT NULL UNIQUE,
  telephone     VARCHAR(20)       NOT NULL,
  mot_de_passe  VARCHAR(255)      NOT NULL,
  photo_profil  VARCHAR(500)      DEFAULT NULL,
  role          ENUM('utilisateur','administrateur') NOT NULL DEFAULT 'utilisateur',
  actif         TINYINT(1)        NOT NULL DEFAULT 1,
  created_at    TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_email (email),
  INDEX idx_telephone (telephone)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE : categories
-- (Utilisée en Phase 2 – Transactions)
-- ============================================================
CREATE TABLE IF NOT EXISTS categories (
  id          INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  nom         VARCHAR(100)      NOT NULL,
  type        ENUM('vente','depense') NOT NULL,
  icone       VARCHAR(10)       DEFAULT '📦',
  couleur     VARCHAR(7)        DEFAULT '#C4622D',
  description VARCHAR(255)      DEFAULT NULL,
  is_system   TINYINT(1)        NOT NULL DEFAULT 0, -- 1 = catégorie système, non supprimable
  created_at  TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_nom_type (nom, type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE : comptes
-- (Solde principal du commerçant – Phase 2)
-- ============================================================
CREATE TABLE IF NOT EXISTS comptes (
  id              INT UNSIGNED  NOT NULL AUTO_INCREMENT,
  utilisateur_id  INT UNSIGNED  NOT NULL,
  solde           DECIMAL(15,2) NOT NULL DEFAULT 0.00,
  devise          VARCHAR(5)    NOT NULL DEFAULT 'XAF',
  updated_at      TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_utilisateur (utilisateur_id),
  CONSTRAINT fk_comptes_utilisateur FOREIGN KEY (utilisateur_id)
    REFERENCES utilisateurs(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- TABLE : transactions
-- (Cœur métier – Phase 2)
-- ============================================================
CREATE TABLE IF NOT EXISTS transactions (
  id              INT UNSIGNED      NOT NULL AUTO_INCREMENT,
  reference       VARCHAR(20)       NOT NULL UNIQUE,  -- ex: TRX-9482
  utilisateur_id  INT UNSIGNED      NOT NULL,
  categorie_id    INT UNSIGNED      NOT NULL,
  type            ENUM('vente','depense') NOT NULL,
  produit_service VARCHAR(255)      NOT NULL,
  quantite        DECIMAL(10,2)     NOT NULL DEFAULT 1,
  prix_unitaire   DECIMAL(15,2)     NOT NULL,
  montant_total   DECIMAL(15,2)     NOT NULL,
  mode_paiement   ENUM('especes','mobile_money','autre') NOT NULL DEFAULT 'especes',
  statut          ENUM('valide','en_attente','annule') NOT NULL DEFAULT 'valide',
  description     TEXT              DEFAULT NULL,
  date_operation  TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at      TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP         NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_utilisateur (utilisateur_id),
  INDEX idx_categorie (categorie_id),
  INDEX idx_type (type),
  INDEX idx_date (date_operation),
  CONSTRAINT fk_transactions_utilisateur FOREIGN KEY (utilisateur_id)
    REFERENCES utilisateurs(id) ON DELETE CASCADE,
  CONSTRAINT fk_transactions_categorie FOREIGN KEY (categorie_id)
    REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- DONNÉES INITIALES : Catégories système
-- (Conformes aux interfaces Monify fournies)
-- ============================================================

-- Catégories de ventes
INSERT IGNORE INTO categories (nom, type, icone, couleur, is_system) VALUES
  ('Alimentation & Vivres', 'vente', '🍎', '#4CAF50', 1),
  ('Boissons',              'vente', '🥤', '#2196F3', 1),
  ('Vêtements & Tissus',    'vente', '👗', '#9C27B0', 1),
  ('Électronique',          'vente', '📱', '#FF9800', 1),
  ('Cosmétiques & Beauté',  'vente', '💄', '#E91E63', 1),
  ('Accessoires',           'vente', '👜', '#795548', 1),
  ('Chaussures',            'vente', '👟', '#607D8B', 1),
  ('Autres ventes',         'vente', '🛍️', '#9E9E9E', 1);

-- Catégories de dépenses
INSERT IGNORE INTO categories (nom, type, icone, couleur, is_system) VALUES
  ('Approvisionnement & Stock', 'depense', '📦', '#FF5722', 1),
  ('Transport & Livraison',     'depense', '🚗', '#03A9F4', 1),
  ('Loyer & Local',             'depense', '🏠', '#8BC34A', 1),
  ('Électricité',               'depense', '⚡', '#FFC107', 1),
  ('Salaires & Personnel',      'depense', '👥', '#3F51B5', 1),
  ('Communication & Internet',  'depense', '📡', '#00BCD4', 1),
  ('Entretien & Réparation',    'depense', '🔧', '#FF9800', 1),
  ('Autres charges',            'depense', '💼', '#9E9E9E', 1);

-- ============================================================
-- FIN DU SCRIPT
-- ============================================================
