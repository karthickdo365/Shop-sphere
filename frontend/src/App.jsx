import { Routes, Route, useLocation } from 'react-router-dom';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import AnnouncementBar from './components/AnnouncementBar.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
import AdminRoute from './components/AdminRoute.jsx';
import Home from './pages/Home.jsx';
import CategoryPage from './pages/CategoryPage.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import CartPage from './pages/CartPage.jsx';
import Checkout from './pages/Checkout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import ForgotPassword from './pages/ForgotPassword.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import Account from './pages/Account.jsx';
import Orders from './pages/Orders.jsx';
import Wishlist from './pages/Wishlist.jsx';
import SearchResults from './pages/SearchResults.jsx';
import NewArrivals from './pages/NewArrivals.jsx';
import Offers from './pages/Offers.jsx';
import NotFound from './pages/NotFound.jsx';
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminProducts from './pages/admin/AdminProducts.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';
import AdminCategories from './pages/admin/AdminCategories.jsx';
import AdminBanners from './pages/admin/AdminBanners.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import AboutUs from './pages/AboutUs.jsx';
import Contact from './pages/Contact.jsx';
import ReturnsPolicy from "./pages/ReturnsPolicy.jsx";
import ShippingPolicy from "./pages/ShippingPolicy.jsx";
import Privacy from "./pages/Privacy.jsx";
import TermsPolicy from "./pages/TermsPolicy.jsx";
import OrderSuccess from "./pages/OrderSuccess";
import Addresses from './pages/Addresses.jsx';



export default function App() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  // Admin routes render their own layout (no public header/footer)
  if (isAdminRoute) {
    return (
      <>
        <ScrollToTop />
        <Routes>
          <Route path="/admin" element={<AdminRoute />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </>
    );
  }

  return (
    <>
      <ScrollToTop />
      <AnnouncementBar />
      <Header />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Home />} />
        
          <Route path="/order-success"element={<OrderSuccess />}/>
          <Route path="/category/:slug" element={<CategoryPage />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/about" element={<AboutUs brandName="ShopSphere" />} />
        
          <Route path='/contact' element={<Contact/>}/>
          <Route path="/policy/returns" element={<ReturnsPolicy />} />
          <Route path="/policy/shipping" element={<ShippingPolicy />} />
        <Route path="/policy/privacy"element={<Privacy />}/>
          <Route path="/policy/terms" element={<TermsPolicy />} />

          <Route element={<ProtectedRoute />}>
  <Route path="/product/:slug" element={<ProductPage />} />
  <Route path="/category/:categoryId" element={<CategoryPage />} />
  <Route path="/addresses" element={<Addresses />} />  {/* add this */}
  {/* ...other routes */}
</Route>
         
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/account" element={<Account />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/search" element={<SearchResults />} />
          <Route path="/new-arrivals" element={<NewArrivals />} />
          <Route path="/offers" element={<Offers />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </>
  );
}
