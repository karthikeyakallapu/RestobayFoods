CREATE TABLE
    `TABLES` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `table_number` VARCHAR(10) NOT NULL,
        `capacity` INT NOT NULL,
        `location` VARCHAR(50) NOT NULL,
        `status` ENUM('ACTIVE', 'INACTIVE', 'MAINTENANCE') NOT NULL DEFAULT 'ACTIVE',
        `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        KEY `idx_tables_capacity` (`capacity`)
    );

INSERT INTO
    `TABLES` (
        `id`,
        `table_number`,
        `capacity`,
        `location`,
        `status`,
        `created_at`,
        `updated_at`
    )
VALUES
    (
        1,
        'A1',
        2,
        'Window',
        'ACTIVE',
        '2025-04-06 06:00:25',
        '2025-04-06 06:00:25'
    ),
    (
        2,
        'A2',
        2,
        'Window',
        'ACTIVE',
        '2025-04-06 06:00:25',
        '2025-04-06 06:00:25'
    ),
    (
        3,
        'A3',
        4,
        'Window',
        'ACTIVE',
        '2025-04-06 06:00:25',
        '2025-04-06 06:00:25'
    ),
    (
        4,
        'B1',
        4,
        'Center',
        'ACTIVE',
        '2025-04-06 06:00:25',
        '2025-04-06 06:00:25'
    ),
    (
        5,
        'B2',
        4,
        'Center',
        'ACTIVE',
        '2025-04-06 06:00:25',
        '2025-04-06 06:00:25'
    ),
    (
        6,
        'B3',
        6,
        'Center',
        'ACTIVE',
        '2025-04-06 06:00:25',
        '2025-04-06 06:00:25'
    ),
    (
        7,
        'C1',
        6,
        'Bar',
        'ACTIVE',
        '2025-04-06 06:00:25',
        '2025-04-06 06:00:25'
    ),
    (
        8,
        'C2',
        8,
        'Bar',
        'ACTIVE',
        '2025-04-06 06:00:25',
        '2025-04-06 06:00:25'
    ),
    (
        9,
        'D1',
        10,
        'Private Room',
        'ACTIVE',
        '2025-04-06 06:00:25',
        '2025-04-06 06:00:25'
    ),
    (
        10,
        'D2',
        12,
        'Private Room',
        'ACTIVE',
        '2025-04-06 06:00:25',
        '2025-04-06 06:00:25'
    ),
    (
        11,
        'E1',
        4,
        'Patio',
        'ACTIVE',
        '2025-04-06 06:00:25',
        '2025-04-06 06:00:25'
    ),
    (
        12,
        'E2',
        4,
        'Patio',
        'ACTIVE',
        '2025-04-06 06:00:25',
        '2025-04-06 06:00:25'
    ),
    (
        13,
        'E3',
        6,
        'Patio',
        'MAINTENANCE',
        '2025-04-06 06:00:25',
        '2025-04-06 06:00:25'
    )
CREATE TABLE
    `USERS` (
        `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        `name` VARCHAR(255) NOT NULL,
        `email` VARCHAR(255) NOT NULL,
        `phone` VARCHAR(20) NOT NULL,
        `password` VARCHAR(255) NOT NULL,
        `verified` TINYINT(1) DEFAULT 0,
        `role` ENUM('customer', 'admin', 'staff') DEFAULT 'customer',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        UNIQUE KEY `uk_users_email` (`email`),
        UNIQUE KEY `uk_users_phone` (`phone`)
    );

CREATE TABLE
    `MENU` (
        `id` INT NOT NULL AUTO_INCREMENT,
        `name` VARCHAR(255) NOT NULL,
        `description` TEXT,
        `price` DECIMAL(10, 2) NOT NULL,
        `category` VARCHAR(100) NOT NULL,
        `image_url` VARCHAR(500) DEFAULT NULL,
        `available` TINYINT(1) DEFAULT 1,
        `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        UNIQUE KEY `uk_menu_name` (`name`)
    );

INSERT INTO
    `MENU` (
        `id`,
        `name`,
        `description`,
        `price`,
        `category`,
        `image_url`,
        `available`,
        `created_at`
    )
VALUES
    (
        1,
        'Paneer Butter Masala',
        'Cottage cheese cubes in a rich butter tomato gravy.',
        280.00,
        'North Indian Curries',
        'paneer_butter_masala.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        2,
        'Dal Makhani',
        'Slow-cooked black lentils in a creamy tomato sauce.',
        250.00,
        'North Indian Curries',
        'dal_makhani.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        3,
        'Shahi Paneer',
        'Paneer in a creamy cashew and tomato gravy.',
        290.00,
        'North Indian Curries',
        'shahi_paneer.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        4,
        'Kadhai Paneer',
        'Paneer cooked with bell peppers in a spicy tomato gravy.',
        260.00,
        'North Indian Curries',
        'kadhai_paneer.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        5,
        'Rajma Masala',
        'Red kidney beans in a spiced tomato curry.',
        220.00,
        'North Indian Curries',
        'rajma_masala.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        6,
        'Malai Kofta',
        'Deep-fried paneer dumplings in a creamy gravy.',
        280.00,
        'North Indian Curries',
        'malai_kofta.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        7,
        'Dum Aloo',
        'Baby potatoes cooked in a rich yogurt-based curry.',
        200.00,
        'North Indian Curries',
        'dum_aloo.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        8,
        'Masala Dosa',
        'Crispy rice crepe filled with spiced mashed potatoes.',
        120.00,
        'South Indian',
        'masala_dosa.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        9,
        'Idli Sambar',
        'Steamed rice cakes served with lentil soup.',
        100.00,
        'South Indian',
        'idli_sambhar.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        10,
        'Medu Vada',
        'Crispy urad dal fritters served with chutney.',
        110.00,
        'South Indian',
        'medu_vada.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        11,
        'Tomato Rasam',
        'Spicy tamarind-based tomato soup.',
        90.00,
        'South Indian',
        'tomato_rasam.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        12,
        'Vegetable Uttapam',
        'Thick pancake topped with veggies.',
        130.00,
        'South Indian',
        'vegetable_uthappam.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        13,
        'Curd Rice',
        'South Indian style creamy yogurt rice.',
        150.00,
        'South Indian',
        'curd_rice.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        14,
        'Lemon Rice',
        'Tangy rice flavored with lemon juice.',
        160.00,
        'South Indian',
        'lemon_rice.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        15,
        'Sambar Rice',
        'Rice mixed with spicy lentil soup.',
        180.00,
        'South Indian',
        'sambhar_rice.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        16,
        'Vegetable Biryani',
        'Fragrant rice cooked with vegetables.',
        220.00,
        'Rice & Biryani',
        'veg_biryani.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        17,
        'Paneer Biryani',
        'Rice cooked with paneer and aromatic spices.',
        250.00,
        'Rice & Biryani',
        'paneer_biryani.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        19,
        'Kashmiri Pulao',
        'Sweet rice cooked with nuts and saffron.',
        260.00,
        'Rice & Biryani',
        'kashmiri_pulao.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        20,
        'Jeera Rice',
        'Cumin-flavored basmati rice.',
        140.00,
        'Rice & Biryani',
        'jeera_rice.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        21,
        'Tomato Rice',
        'Rice cooked with tomatoes and spices.',
        170.00,
        'Rice & Biryani',
        'tomato_rice.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        22,
        'Pav Bhaji',
        'Spiced mashed vegetables served with buttered pav.',
        150.00,
        'Street Food',
        'pav_bhaji.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        23,
        'Vada Pav',
        'Spicy potato fritter sandwiched in a bun.',
        60.00,
        'Street Food',
        'vada_paav.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        24,
        'Dhokla',
        'Steamed fermented gram flour cake.',
        90.00,
        'Street Food',
        'dhokla.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        25,
        'Chole Bhature',
        'Spicy chickpeas served with deep-fried bhature.',
        200.00,
        'Street Food',
        'chole_bhature.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        26,
        'Aloo Tikki',
        'Crispy fried potato patties served with chutneys.',
        80.00,
        'Street Food',
        'aloo_tikki.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        27,
        'Bhel Puri',
        'Crispy puffed rice with tangy tamarind chutney.',
        70.00,
        'Street Food',
        'bhel_puri.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        28,
        'Butter Naan',
        'Soft leavened bread with butter.',
        40.00,
        'Indian Breads',
        'butter_naan.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        29,
        'Tandoori Roti',
        'Whole wheat bread cooked in a tandoor.',
        30.00,
        'Indian Breads',
        'tandoori_roti.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        30,
        'Missi Roti',
        'Spiced gram flour flatbread.',
        35.00,
        'Indian Breads',
        'missi_roti.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        31,
        'Aloo Paratha',
        'Stuffed wheat flatbread with spiced potatoes.',
        80.00,
        'Indian Breads',
        'aloo_paratha.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        32,
        'Gulab Jamun',
        'Deep-fried milk dumplings soaked in sugar syrup.',
        120.00,
        'Desserts',
        'gulab_jamun.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        33,
        'Rasgulla',
        'Spongy cheese balls soaked in light sugar syrup.',
        110.00,
        'Desserts',
        'rasgulla.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        34,
        'Jalebi',
        'Crispy deep-fried spirals soaked in sugar syrup.',
        100.00,
        'Desserts',
        'jalebi.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        35,
        'Kheer',
        'Slow-cooked rice pudding with milk and dry fruits.',
        140.00,
        'Desserts',
        'kheer.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        36,
        'Mysore Pak',
        'Gram flour and ghee-based soft fudge.',
        150.00,
        'Desserts',
        'mysore_pak.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        37,
        'Rabri',
        'Thick sweetened milk topped with nuts.',
        160.00,
        'Desserts',
        'rabri.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        38,
        'Masala Chai',
        'Spiced Indian tea with milk.',
        50.00,
        'Beverages',
        'masala_chai.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        39,
        'Lassi',
        'Thick sweet yogurt-based drink.',
        90.00,
        'Beverages',
        'lassi.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        40,
        'Jaljeera',
        'Tangy spiced cumin water.',
        60.00,
        'Beverages',
        'jaljeera.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        41,
        'Aam Panna',
        'Raw mango cooler with mint and spices.',
        60.00,
        'Desserts',
        'aam_panna.png',
        1,
        '2025-03-08 04:20:13'
    ),
    (
        42,
        'Badam Milk',
        'Almond-flavored sweetened milk.',
        120.00,
        'Beverages',
        'badam_milk.png',
        1,
        '2025-03-08 04:20:13'
    );

CREATE TABLE
    `TABLE_BOOKINGS` (
        `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `table_id` INT NOT NULL,
        `user_id` BIGINT UNSIGNED NOT NULL,
        `booking_date` DATE NOT NULL,
        `start_time` TIME NOT NULL,
        `end_time` TIME NOT NULL,
        `number_of_people` INT NOT NULL,
        `status` ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'EXPIRED') DEFAULT 'PENDING',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (`table_id`) REFERENCES `TABLES` (`id`) ON DELETE CASCADE,
        FOREIGN KEY (`user_id`) REFERENCES `USERS` (`id`) ON DELETE CASCADE,
        INDEX `idx_booking_date` (`booking_date`),
        INDEX `idx_table_time` (
            `table_id`,
            `booking_date`,
            `start_time`,
            `end_time`
        )
    );

CREATE TABLE
    `TABLE_BOOKING_PAYMENTS` (
        `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `booking_id` BIGINT UNSIGNED UNIQUE,
        `user_id` BIGINT UNSIGNED,
        `amount` DECIMAL(10, 2) NOT NULL,
        `transaction_id` VARCHAR(100),
        `payment_id` VARCHAR(100),
        `payment_status` ENUM('PENDING', 'SUCCESS', 'FAILED') DEFAULT 'PENDING',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (`booking_id`) REFERENCES `TABLE_BOOKINGS` (`id`) ON DELETE CASCADE,
        FOREIGN KEY (`user_id`) REFERENCES `USERS` (`id`) ON DELETE CASCADE,
        INDEX `idx_payment_status` (`payment_status`)
    );

CREATE TABLE
    `CARTS` (
        `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
        `user_id` BIGINT UNSIGNED NOT NULL,
        `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        UNIQUE KEY `uk_cart_user` (`user_id`),
        CONSTRAINT `fk_cart_user` FOREIGN KEY (`user_id`) REFERENCES `USERS` (`id`) ON DELETE CASCADE
    );

CREATE TABLE
    `CART_ITEMS` (
        `id` BIGINT NOT NULL AUTO_INCREMENT,
        `cart_id` BIGINT UNSIGNED NOT NULL,
        `item_id` INT NOT NULL,
        `quantity` INT NOT NULL DEFAULT 1,
        `price` DECIMAL(10, 2) NOT NULL,
        `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (`id`),
        UNIQUE KEY `unique_product_in_cart` (`cart_id`, `item_id`),
        CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `CARTS` (`id`)
    );

CREATE TABLE
    `ORDERS` (
        `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `user_id` BIGINT UNSIGNED NOT NULL,
        `transaction_id` VARCHAR(100) UNIQUE, -- Razorpay order id
        `payment_id` VARCHAR(100) UNIQUE, -- Razorpay payment id
        `total_amount` DECIMAL(12, 2) NOT NULL,
        `status` ENUM(
            'PAYMENT_PENDING',
            'CONFIRMED',
            'CANCELLED',
            'FAILED'
        ) NOT NULL DEFAULT 'PAYMENT_PENDING',
        `payment_status` ENUM('PENDING', 'SUCCESS', 'FAILED') NOT NULL DEFAULT 'PENDING',
        `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        CONSTRAINT `fk_orders_user` FOREIGN KEY (`user_id`) REFERENCES `USERS` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
        INDEX `idx_orders_user_created` (`user_id`, `created_at`),
        INDEX `idx_orders_status` (`status`),
        INDEX `idx_orders_payment_status` (`payment_status`)
    );

CREATE TABLE
    `ORDER_ITEMS` (
        `id` BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        `order_id` BIGINT UNSIGNED NOT NULL,
        `item_id` INT NOT NULL,
        `price` DECIMAL(12, 2) NOT NULL,
        `quantity` INT UNSIGNED NOT NULL CHECK (`quantity` > 0),
        `subtotal` DECIMAL(12, 2) GENERATED ALWAYS AS (`price` * `quantity`) STORED,
        `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT `fk_order_items_order` FOREIGN KEY (`order_id`) REFERENCES `ORDERS` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT `fk_order_items_item` FOREIGN KEY (`item_id`) REFERENCES `MENU` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
        UNIQUE KEY `uniq_order_item` (`order_id`, `item_id`),
        INDEX `idx_order_items_order` (`order_id`),
        INDEX `idx_order_items_item` (`item_id`)
    );