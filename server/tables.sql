CREATE TABLE
    users (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(20) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        verified BOOLEAN DEFAULT 0, -- User is not verified by default
        role ENUM ('customer', 'admin', 'staff') DEFAULT 'customer',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Create carts table
CREATE TABLE
    carts (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );

-- Create cart_items table
CREATE TABLE
    cart_items (
        id BIGINT AUTO_INCREMENT PRIMARY KEY,
        cart_id BIGINT NOT NULL,
        item_id INT NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cart_id) REFERENCES carts (id),
        CONSTRAINT unique_product_in_cart UNIQUE (cart_id, item_id)
    );

-- Orders Table
CREATE TABLE
    orders (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        total_amount DECIMAL(10, 2) NOT NULL,
        status ENUM('OPEN', 'INPROGRESS', 'CANCELLED', 'COMPLETED') DEFAULT 'OPEN',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

-- Order payments table 
CREATE TABLE
    order_payments (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        order_id BIGINT UNSIGNED NOT NULL,
        user_id BIGINT UNSIGNED NOT NULL,
        amount DECIMAL(10, 2) NOT NULL,
        currency VARCHAR(5) NOT NULL DEFAULT 'INR',
        transaction_id VARCHAR(255),
        payment_status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
        payment_method VARCHAR(50),
        payment_date TIMESTAMP NULL,
        verification_signature VARCHAR(255), -- Razorpay signature for payment verification
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

CREATE TABLE
    order_items (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        order_id BIGINT UNSIGNED NOT NULL,
        item_id INT NOT NULL, -- Matches with cart_items.item_id
        quantity INT NOT NULL DEFAULT 1,
        price DECIMAL(10, 2) NOT NULL,
        status ENUM(
            'OPEN',
            'CANCELLED',
            'INPROGRESS',
            'REFUNDED',
            'COMPLETED'
        ) DEFAULT 'OPEN',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        deleted_at TIMESTAMP NULL,
        FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
        INDEX (order_id),
        INDEX (item_id)
    );

-- Tables table to store restaurant tables
CREATE TABLE
    `tables` (
        `id` INT PRIMARY KEY AUTO_INCREMENT,
        `table_number` VARCHAR(10) NOT NULL,
        `capacity` INT NOT NULL,
        `location` VARCHAR(50) NOT NULL,
        `status` ENUM('active', 'inactive', 'maintenance') NOT NULL DEFAULT 'active',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    );

-- Bookings table to store reservations
CREATE TABLE
    `table_bookings` (
        `id` INT PRIMARY KEY AUTO_INCREMENT,
        `table_id` INT NOT NULL,
        `table_number` VARCHAR(10) NOT NULL,
        `booking_date` DATE NOT NULL,
        `start_time` TIME NOT NULL,
        `end_time` TIME NOT NULL,
        `number_of_people` INT NOT NULL,
        `user_id` BIGINT UNSIGNED NOT NULL,
        `status` ENUM('CONFIRMED', 'CANCELLED', 'PENDING', 'FREE') NOT NULL DEFAULT 'PENDING',
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (`table_id`) REFERENCES `tables` (`id`),
        FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
    );

-- Create a separate table for booking payments
CREATE TABLE
    `table_booking_payments` (
        `id` INT PRIMARY KEY AUTO_INCREMENT,
        `booking_id` INT NOT NULL,
        `user_id` BIGINT UNSIGNED NOT NULL,
        `amount` DECIMAL(10, 2) NOT NULL,
        `currency` VARCHAR(5) NOT NULL DEFAULT 'INR',
        `transaction_id` VARCHAR(100),
        `payment_status` ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
        `payment_method` VARCHAR(50),
        `payment_date` TIMESTAMP NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (`booking_id`) REFERENCES `table_bookings` (`id`) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

-- Indexes for faster querying
CREATE INDEX idx_bookings_date_time ON table_bookings (booking_date, start_time, end_time);

CREATE INDEX idx_booking_payments ON table_booking_payments (booking_id, payment_status);

CREATE INDEX idx_user_payments ON table_booking_payments (user_id, payment_status);

CREATE INDEX idx_tables_capacity ON tables (capacity);

-- Sample data for tables
INSERT INTO
    `tables` (`table_number`, `capacity`, `location`, `status`)
VALUES
    ('A1', 2, 'Window', 'active'),
    ('A2', 2, 'Window', 'active'),
    ('A3', 4, 'Window', 'active'),
    ('B1', 4, 'Center', 'active'),
    ('B2', 4, 'Center', 'active'),
    ('B3', 6, 'Center', 'active'),
    ('C1', 6, 'Bar', 'active'),
    ('C2', 8, 'Bar', 'active'),
    ('D1', 10, 'Private Room', 'active'),
    ('D2', 12, 'Private Room', 'active'),
    ('E1', 4, 'Patio', 'active'),
    ('E2', 4, 'Patio', 'active'),
    ('E3', 6, 'Patio', 'maintenance');

-- Menu Items  
INSERT INTO
    menu (
        id,
        name,
        description,
        price,
        category,
        image_url,
        available
    )
VALUES
    (
        1,
        'Paneer Butter Masala',
        'Cottage cheese cubes in a rich butter tomato gravy.',
        280.00,
        'North Indian Curries',
        'https://example.com/paneer_butter_masala.jpg',
        0
    ),
    (
        2,
        'Dal Makhani',
        'Slow-cooked black lentils in a creamy tomato sauce.',
        250.00,
        'North Indian Curries',
        'https://example.com/dal_makhani.jpg',
        1
    ),
    (
        3,
        'Shahi Paneer',
        'Paneer in a creamy cashew and tomato gravy.',
        290.00,
        'North Indian Curries',
        'https://example.com/shahi_paneer.jpg',
        1
    ),
    (
        4,
        'Kadhai Paneer',
        'Paneer cooked with bell peppers in a spicy tomato gravy.',
        260.00,
        'North Indian Curries',
        'https://example.com/kadhai_paneer.jpg',
        1
    ),
    (
        5,
        'Rajma Masala',
        'Red kidney beans in a spiced tomato curry.',
        220.00,
        'North Indian Curries',
        'https://example.com/rajma_masala.jpg',
        1
    ),
    (
        6,
        'Malai Kofta',
        'Deep-fried paneer dumplings in a creamy gravy.',
        280.00,
        'North Indian Curries',
        'https://example.com/malai_kofta.jpg',
        1
    ),
    (
        7,
        'Dum Aloo',
        'Baby potatoes cooked in a rich yogurt-based curry.',
        200.00,
        'North Indian Curries',
        'https://example.com/dum_aloo.jpg',
        1
    ),
    (
        8,
        'Masala Dosa',
        'Crispy rice crepe filled with spiced mashed potatoes.',
        120.00,
        'South Indian',
        'https://example.com/masala_dosa.jpg',
        1
    ),
    (
        9,
        'Idli Sambar',
        'Steamed rice cakes served with lentil soup.',
        100.00,
        'South Indian',
        'https://example.com/idli_sambar.jpg',
        1
    ),
    (
        10,
        'Medu Vada',
        'Crispy urad dal fritters served with chutney.',
        110.00,
        'South Indian',
        'https://example.com/medu_vada.jpg',
        0
    ),
    (
        11,
        'Tomato Rasam',
        'Spicy tamarind-based tomato soup.',
        90.00,
        'South Indian',
        'https://example.com/tomato_rasam.jpg',
        1
    ),
    (
        12,
        'Vegetable Uttapam',
        'Thick pancake topped with veggies.',
        130.00,
        'South Indian',
        'https://example.com/vegetable_uttapam.jpg',
        1
    ),
    (
        13,
        'Curd Rice',
        'South Indian style creamy yogurt rice.',
        150.00,
        'South Indian',
        'https://example.com/curd_rice.jpg',
        1
    ),
    (
        14,
        'Lemon Rice',
        'Tangy rice flavored with lemon juice.',
        160.00,
        'South Indian',
        'https://example.com/lemon_rice.jpg',
        1
    ),
    (
        15,
        'Sambar Rice',
        'Rice mixed with spicy lentil soup.',
        180.00,
        'South Indian',
        'https://example.com/sambar_rice.jpg',
        1
    ),
    (
        16,
        'Vegetable Biryani',
        'Fragrant rice cooked with vegetables.',
        220.00,
        'Rice & Biryani',
        'https://example.com/vegetable_biryani.jpg',
        1
    ),
    (
        17,
        'Paneer Biryani',
        'Rice cooked with paneer and aromatic spices.',
        250.00,
        'Rice & Biryani',
        'https://example.com/paneer_biryani.jpg',
        1
    ),
    (
        19,
        'Kashmiri Pulao',
        'Sweet rice cooked with nuts and saffron.',
        260.00,
        'Rice & Biryani',
        'https://example.com/kashmiri_pulao.jpg',
        1
    ),
    (
        20,
        'Jeera Rice',
        'Cumin-flavored basmati rice.',
        140.00,
        'Rice & Biryani',
        'https://example.com/jeera_rice.jpg',
        0
    ),
    (
        21,
        'Tomato Rice',
        'Rice cooked with tomatoes and spices.',
        170.00,
        'Rice & Biryani',
        'https://example.com/tomato_rice.jpg',
        1
    ),
    (
        22,
        'Pav Bhaji',
        'Spiced mashed vegetables served with buttered pav.',
        150.00,
        'Street Food',
        'https://example.com/pav_bhaji.jpg',
        1
    ),
    (
        23,
        'Vada Pav',
        'Spicy potato fritter sandwiched in a bun.',
        60.00,
        'Street Food',
        'https://example.com/vada_pav.jpg',
        1
    ),
    (
        24,
        'Dhokla',
        'Steamed fermented gram flour cake.',
        90.00,
        'Street Food',
        'https://example.com/dhokla.jpg',
        1
    ),
    (
        25,
        'Chole Bhature',
        'Spicy chickpeas served with deep-fried bhature.',
        200.00,
        'Street Food',
        'https://example.com/chole_bhature.jpg',
        1
    ),
    (
        26,
        'Aloo Tikki',
        'Crispy fried potato patties served with chutneys.',
        80.00,
        'Street Food',
        'https://example.com/aloo_tikki.jpg',
        1
    ),
    (
        27,
        'Bhel Puri',
        'Crispy puffed rice with tangy tamarind chutney.',
        70.00,
        'Street Food',
        'https://example.com/bhel_puri.jpg',
        1
    ),
    (
        28,
        'Butter Naan',
        'Soft leavened bread with butter.',
        40.00,
        'Indian Breads',
        'https://example.com/butter_naan.jpg',
        1
    ),
    (
        29,
        'Tandoori Roti',
        'Whole wheat bread cooked in a tandoor.',
        30.00,
        'Indian Breads',
        'https://example.com/tandoori_roti.jpg',
        1
    ),
    (
        30,
        'Missi Roti',
        'Spiced gram flour flatbread.',
        35.00,
        'Indian Breads',
        'https://example.com/missi_roti.jpg',
        1
    ),
    (
        31,
        'Aloo Paratha',
        'Stuffed wheat flatbread with spiced potatoes.',
        80.00,
        'Indian Breads',
        'https://example.com/aloo_paratha.jpg',
        1
    ),
    (
        32,
        'Gulab Jamun',
        'Deep-fried milk dumplings soaked in sugar syrup.',
        120.00,
        'Desserts',
        'https://example.com/gulab_jamun.jpg',
        1
    ),
    (
        33,
        'Rasgulla',
        'Spongy cheese balls soaked in light sugar syrup.',
        110.00,
        'Desserts',
        'https://example.com/rasgulla.jpg',
        1
    ),
    (
        34,
        'Jalebi',
        'Crispy deep-fried spirals soaked in sugar syrup.',
        100.00,
        'Desserts',
        'https://example.com/jalebi.jpg',
        1
    ),
    (
        35,
        'Kheer',
        'Slow-cooked rice pudding with milk and dry fruits.',
        140.00,
        'Desserts',
        'https://example.com/kheer.jpg',
        1
    ),
    (
        36,
        'Mysore Pak',
        'Gram flour and ghee-based soft fudge.',
        150.00,
        'Desserts',
        'https://example.com/mysore_pak.jpg',
        1
    ),
    (
        37,
        'Rabri',
        'Thick sweetened milk topped with nuts.',
        160.00,
        'Desserts',
        'https://example.com/rabri.jpg',
        1
    ),
    (
        38,
        'Masala Chai',
        'Spiced Indian tea with milk.',
        50.00,
        'Beverages',
        'https://example.com/masala_chai.jpg',
        1
    ),
    (
        39,
        'Lassi',
        'Thick sweet yogurt-based drink.',
        90.00,
        'Beverages',
        'https://example.com/lassi.jpg',
        1
    ),
    (
        40,
        'Jaljeera',
        'Tangy spiced cumin water.',
        60.00,
        'Beverages',
        'https://example.com/jaljeera.jpg',
        1
    ),
    (
        41,
        'Aam Panna',
        'Raw mango cooler with mint and spices.',
        80.00,
        'Desserts',
        'https://example.com/aam_panna.jpg',
        0
    ),
    (
        42,
        'Badam Milk',
        'Almond-flavored sweetened milk.',
        120.00,
        'Beverages',
        'https://example.com/badam_milk.jpg',
        1
    );