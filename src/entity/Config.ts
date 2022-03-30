export class Config {

    env: string;

    server: {
        host: string,
        port: number,
        useSSL: boolean,
        ssl_key_path: string,
        ssl_cert_path: string
    };

    static CONFIGURATION: Config;

}