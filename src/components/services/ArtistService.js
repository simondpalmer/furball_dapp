
const KEYS = {
    designs:"designs",
    designId: "designId"
}

export const getfeatureCollection = () => ([
    {id:"1", title:"Toony"},
    {id:"2", title:"Feral"},
])

export function insertArtwork(data) {
    let designs = getAllDesigns();
    data['id'] = generateDesignId();
    designs.push(data)
    localStorage.setItem(KEYS.designs,JSON.stringify(designs))
}

export function generateDesignId() {
    if (localStorage.getItem(KEYS.designId) == null)
        localStorage.setItem(KEYS.designId, "0")
    var id = parseInt(localStorage.getItem(KEYS.designId))
    localStorage.setItem(KEYS.designId, (++id).toString())
    return id;   
}

export function getAllDesigns() {
    if (localStorage.getItem(KEYS.designs) == null)
        localStorage.setItem(KEYS.designs, JSON.stringify([]))
    return JSON.parse(localStorage.getItem(KEYS.designs));
}