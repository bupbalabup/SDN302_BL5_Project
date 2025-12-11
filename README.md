# SDN302_Project_eBay


B1: Tạo files .env:
1.1 Tạo .env FE:

    .env FE: 
    NEXT_PUBLIC_API_URL=http://localhost:9999/ (thay bằng backend của mình)

1.2 Tạo .env BE:

    .env BE: 
    PORT=9999 (port for server)
    MONGO_URI=mongodb://127.0.0.1:27017/
    DB_NAME=ebay-clone
    HOST_NAME=localhost
    JWT_SECRET=your_access_secret_key
    JWT_REFRESH_SECRET=your_refresh_secret_key
    JWT_ACCESS_SECRET=access_secret_key_example
    
    EMAIL_USER=(Your email)
    EMAIL_PASS=(Your app password)

    GOOGLE_CLIENT_ID=(Your google client id)
    GOOGLE_CLIENT_SECRET=(Your google secret id)
    GOOGLE_CALLBACK_URL=(Your callback url)
    SESSION_SECRET=(Your session secret key)

    FRONTEND_URL=http://localhost:3000 (Your FE URL here)
    
B2: chạy: npm i
    cho cả be và fe
    
B3: 

Chạy FE: npm run dev 

Chạy BE: npm start
