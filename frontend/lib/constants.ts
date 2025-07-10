export const TEST_CASE = `Your task is to purchase 2 clothing items: a green shirt and a striped black & white polo, under $50.
Navigate to clothes, filter on Men and set the max price to $50.
Add to the cart the first green shirt that you see, and the first striped black & white polo. 
You can add these items to the cart by tapping the cart icon on the item cards.
As long as you haven't found these items, continue to the next page if there is one (you can see page navigation at the bottom of the page).
Once you have added these items to the cart, go to the cart (tap on the cart icon on the right of the top navbar, scroll up if you don't see it), enter shipping details with the user info and checkout.`;

export const MOBILE_TEST_CASE = `Your task is to purchase 2 clothing items on mobile: a green shirt and a striped black & white polo, under $50.
Use mobile interactions: tap to navigate, swipe to scroll, and pinch to zoom if needed.
Navigate to clothes by tapping, use mobile filters to select Men and set max price to $50.
Add to cart by tapping the cart icon on item cards - ensure you tap accurately for mobile.
Use swipe gestures to scroll through products if needed.
Once items are added, tap the cart icon (usually in top right or bottom navigation).
Fill out the mobile checkout form - remember mobile forms may have different layouts.
Complete the purchase using mobile-friendly interactions.`;

export const TEST_APP_URL = "http://localhost:3005";
export const USERNAME = "test_user_name";
export const PASSWORD = "test_password";

export const USER_INFO = {
  name: "Cua Blossom",
  email: "cua@example.com",
  address: "123 Main St, Anytown, USA",
};
