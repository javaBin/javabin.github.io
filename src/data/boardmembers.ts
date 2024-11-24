export type BoardMemberType = {
  name: string
  title:
    | "Chairman"
    | "Deputy Chairman"
    | "Financial Controller"
    | "Board Member"
  img: string
}

const members: BoardMemberType[] = [
  {
    name: "Alexander Samsig",
    title: "Chairman",
    img: "alexander_samsig.jpg",
  },
  {
    name: "Øyvind Løkling",
    title: "Deputy Chairman",
    img: "øyvind_løkling.jpg",
  },
  {
    name: "Rafael Winterhalter",
    title: "Financial Controller",
    img: "rafael_winterhalter.jpg",
  },
  {
    name: "Dervis Mansuroglu",
    title: "Board Member",
    img: "dervis_mansuroglu.jpg",
  },
  {
    name: "Karl Syvert Løland",
    title: "Board Member",
    img: "karl_syvert_loland.jpg",
  },
  {
    name: "Børge Nese",
    title: "Board Member",
    img: "børge_nese.jpg",
  },
  {
    name: "Alexander Amiri",
    title: "Board Member",
    img: "alexander_amiri.jpg",
  },
  {
    name: "Sverre Moe",
    title: "Board Member",
    img: "sverre_moe.jpg",
  },
  {
    name: "Orathai Mai Khanasa",
    title: "Board Member",
    img: "orathai_mai_khanasa.jpg",
  },
  {
    name: "Chris Searle",
    title: "Board Member",
    img: "chris_searle.jpg",
  },
  {
    name: "Janniche Lange",
    title: "Board Member",
    img: "janniche_lange.jpg",
  },
]

export default members
