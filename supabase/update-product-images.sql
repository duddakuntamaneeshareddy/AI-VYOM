-- Update product image_url to local static images in public/images/products/
-- Run this in the Supabase SQL editor to fix existing product images

UPDATE public.products SET image_url = '/images/products/headphones.png' WHERE name = 'Wireless Noise-Canceling Headphones';
UPDATE public.products SET image_url = '/images/products/smartwatch.png' WHERE name = 'Smart Watch Series 7';
UPDATE public.products SET image_url = '/images/products/backpack.png' WHERE name = 'Minimalist Leather Backpack';
UPDATE public.products SET image_url = '/images/products/sneakers.png' WHERE name = 'Running Performance Sneakers';
UPDATE public.products SET image_url = '/images/products/coffee_set.png' WHERE name = 'Ceramic Pour-Over Coffee Set';
UPDATE public.products SET image_url = '/images/products/smart_speaker.png' WHERE name = 'Smart Home Speaker';
UPDATE public.products SET image_url = '/images/products/throw_blanket.png' WHERE name = 'Cotton Linen Throw Blanket';
UPDATE public.products SET image_url = '/images/products/fiction_novel.png' WHERE name = 'Bestseller Fiction Novel';
UPDATE public.products SET image_url = '/images/products/yoga_mat.png' WHERE name = 'Yoga Mat Premium';
UPDATE public.products SET image_url = '/images/products/dumbbell_set.png' WHERE name = 'Adjustable Dumbbell Set';
UPDATE public.products SET image_url = '/images/products/mechanical_keyboard.png' WHERE name = 'Mechanical Keyboard';
UPDATE public.products SET image_url = '/images/products/cotton_tshirt.png' WHERE name = 'Organic Cotton T-Shirt';
UPDATE public.products SET image_url = '/images/products/diffuser.png' WHERE name = 'Aromatherapy Diffuser';
UPDATE public.products SET image_url = '/images/products/productivity_book.png' WHERE name = 'Self-Help Productivity Book';
UPDATE public.products SET image_url = '/images/products/basketball.png' WHERE name = 'Basketball Pro';
