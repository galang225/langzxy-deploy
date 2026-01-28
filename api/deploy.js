const axios = require('axios');
const settings = require('../settings');

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ success: false, message: 'Gunakan POST!' });
    }

    try {
        // Ambil data (Vercel menghandle parsing FormData/JSON secara otomatis)
        const { subdomain, rootDomain } = req.body;
        const targetDomain = rootDomain || "langz4youu.my.id";
        
        // Pastikan settings ada
        if (!settings.subdomain[targetDomain]) {
            return res.status(400).json({ success: false, message: 'Domain tidak terdaftar di settings!' });
        }

        const config = settings.subdomain[targetDomain];

        // GAS: Daftar ke Cloudflare
        await axios.post(
            `https://api.cloudflare.com/client/v4/zones/${config.zone}/dns_records`,
            {
                type: 'CNAME',
                name: subdomain,
                content: 'cname.vercel-dns.com', 
                ttl: 1,
                proxied: true
            },
            {
                headers: {
                    'Authorization': `Bearer ${config.apitoken}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return res.status(200).json({ 
            success: true, 
            url: `https://${subdomain}.${targetDomain}` 
        });

    } catch (error) {
        // Biar ketahuan errornya apa di log Vercel
        const errorMsg = error.response ? JSON.stringify(error.response.data) : error.message;
        return res.status(500).json({ success: false, message: errorMsg });
    }
}
