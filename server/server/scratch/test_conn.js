import https from "https";

console.log("Attempting to fetch google.com...");
https.get("https://www.google.com", (res) => {
    console.log("Status Code:", res.statusCode);
    res.on("data", (d) => {
        // console.log(d.toString());
    });
}).on("error", (e) => {
    console.error("Error:", e);
});
