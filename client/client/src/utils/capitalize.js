export default function capitalize(str) {
    if (!str) return "";
    return str.toUpperCase().slice(0, 1) + str.toLowerCase().slice(1);
}
