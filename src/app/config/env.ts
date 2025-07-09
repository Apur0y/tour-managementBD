import dotenv from 'dotenv'

dotenv.config();

export const envVars={
    port:'5000',
    DB_URL:process.env.DB_URL
}