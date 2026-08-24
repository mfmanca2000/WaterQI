import { Client, TablesDB } from "node-appwrite";

// Public endpoint pinged by an external scheduler to keep the Appwrite
// project active on the free tier (which pauses projects after 7 days
// with no *development* activity). Appwrite only counts authenticated
// server-key operations as development activity — plain client-SDK
// reads (the previous implementation) don't prevent the pause. So this
// writes a heartbeat row using a server API key instead.
const HEARTBEAT_ROW_ID = "heartbeat";

export default async function handler(req, res) {
    if (req.method !== "GET" && req.method !== "HEAD") {
        res.setHeader("Allow", "GET, HEAD");
        return res.status(405).json({ status: "error", message: "Method not allowed" });
    }

    try {
        const client = new Client()
            .setEndpoint(process.env.APPWRITE_URL)
            .setProject(process.env.APPWRITE_PROJECT_ID)
            .setKey(process.env.APPWRITE_API_KEY);

        const tablesDB = new TablesDB(client);
        const now = new Date().toISOString();

        await tablesDB.upsertRow({
            databaseId: process.env.APPWRITE_DATABASE_ID,
            tableId: process.env.APPWRITE_KEEPALIVE_TABLE_ID,
            rowId: HEARTBEAT_ROW_ID,
            data: { pingedAt: now },
        });

        if (req.method === "HEAD") {
            return res.status(200).end();
        }

        return res.status(200).json({ status: "ok", timestamp: now });
    } catch (error) {
        console.log("--- keepalive endpoint error: " + error);
        if (req.method === "HEAD") {
            return res.status(502).end();
        }
        return res.status(502).json({ status: "error", message: "Failed to reach Appwrite" });
    }
}
