import dns from "dns";

console.log("Setting DNS servers to 8.8.8.8...");
dns.setServers(['8.8.8.8']);
console.log("Resolving smtp.gmail.com...");
dns.resolve4("smtp.gmail.com", (err, addresses) => {
    if (err) {
        console.error("DNS Error:", err);
        return;
    }
    console.log("Addresses:", addresses);
});
