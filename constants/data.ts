import icons from "./icons";
import images from "./images";

export const cards = [
  {
    title: "Card 1",
    location: "Location 1",
    price: "$100",
    rating: 4.8,
    category: "house",
    image: images.newYork,
  },
  {
    title: "Card 2",
    location: "Location 2",
    price: "$200",
    rating: 3,
    category: "house",
    image: images.japan,
  },
  {
    title: "Card 3",
    location: "Location 3",
    price: "$300",
    rating: 2,
    category: "flat",
    image: images.newYork,
  },
  {
    title: "Card 4",
    location: "Location 4",
    price: "$400",
    rating: 5,
    category: "villa",
    image: images.japan,
  },
];

export const featuredCards = [
  {
    title: "Featured 1",
    location: "Location 1",
    price: "$100",
    rating: 4.8,
    image: images.newYork,
    category: "house",
  },
  {
    title: "Featured 2",
    location: "Location 2",
    price: "$200",
    rating: 3,
    image: images.japan,
    category: "flat",
  },
];

export const categories = [
  { title: "All", category: "All" },
  { title: "Houses", category: "House" },
  { title: "Condos", category: "Condos" },
  { title: "Duplexes", category: "Duplexes" },
  { title: "Studios", category: "Studios" },
  { title: "Villas", category: "Villa" },
  { title: "Apartments", category: "Apartments" },
  { title: "Townhomes", category: "Townhomes" },
  { title: "Others", category: "Others" },
];

export const settings = [
  
  {
    title: "My Enquires",
    subtitle: "All my car enquires",
    icon: icons.questioning,
    onPress: '/dashboard/myenquires',
  },
  {
    title: "Car Loan",
    subtitle: "Get Car Loan At Best Rates",
    icon: icons.signing,
    onPress: '/dashboard/carloan',
  },
  {
    title: "Buy Insurance",
    subtitle: "Buy Insurance For Your Car",
    icon: icons.clipboard,
    onPress: '/dashboard/carinsurance',
  },
  {
    title: "My Vehicles",
    subtitle: "All my vehicles list",
    icon: icons.showroom,
    onPress: '/myvehicles',
  },
  {
    title: "Sell Your Car",
    subtitle: "Sell Your Car With Ease",
    icon: icons.sell,
    onPress: '/sellvehicle',
  },

];

export const facilities = [
  {
    title: "Laundry",
    icon: icons.laundry,
  },
  {
    title: "Car Parking",
    icon: icons.carPark,
  },
  {
    title: "Sports Center",
    icon: icons.run,
  },
  {
    title: "Cutlery",
    icon: icons.cutlery,
  },
  {
    title: "Gym",
    icon: icons.dumbell,
  },
  {
    title: "Swimming pool",
    icon: icons.swim,
  },
  {
    title: "Wifi",
    icon: icons.wifi,
  },
  {
    title: "Pet Center",
    icon: icons.dog,
  },
];

export const gallery = [
  {
    id: 1,
    image: images.newYork,
  },
  {
    id: 2,
    image: images.japan,
  },
  {
    id: 3,
    image: images.newYork,
  },
  {
    id: 4,
    image: images.japan,
  },
  {
    id: 5,
    image: images.newYork,
  },
  {
    id: 6,
    image: images.japan,
  },
];
