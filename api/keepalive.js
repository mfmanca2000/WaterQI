import { Client, Databases, Query } from "appwrite";

// Public endpoint pinged by an external scheduler to keep the Appwrite
// project active on the free tier (which pauses inactive projects).
export default async function handler(req, res) {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).json({ status: "error", message: "Method not allowed" });
    }

    try {
        const client = new Client()
            .setEndpoint(process.env.APPWRITE_URL)
            .setProject(process.env.APPWRITE_PROJECT_ID);

        const databases = new Databases(client);

        const result = await databases.listDocuments(
            process.env.APPWRITE_DATABASE_ID,
            process.env.APPWRITE_LOCATIONS_COLLECTION_ID,
            [Query.limit(3), Query.select(["$id"])]
        );

        return res.status(200).json({
            status: "ok",
            timestamp: new Date().toISOString(),
            documentsRetrieved: result.documents.length,
        });
    } catch (error) {
        console.log("--- keepalive endpoint error: " + error);
        return res.status(502).json({ status: "error", message: "Failed to reach Appwrite" });
    }
}
