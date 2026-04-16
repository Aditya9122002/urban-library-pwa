import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import WelcomeScreen from './screens/auth/WelcomeScreen'
import LoginScreen from './screens/auth/LoginScreen'
import RegisterScreen from './screens/auth/RegisterScreen'
import BookCatalogue from './screens/member/BookCatalogue'
import BookDetail from './screens/member/BookDetail'
import MyBooks from './screens/member/MyBooks'
import ProfileScreen from './screens/member/ProfileScreen'
import AdminHome from './screens/admin/AdminHome'
import BorrowedList from './screens/admin/BorrowedList'
import OverdueList from './screens/admin/OverdueList'
import BookManagement from './screens/admin/BookManagement'
import MemberManagement from './screens/admin/MemberManagement'
import BottomNav from './components/BottomNav'

const memberRoutes = ['/books', '/mybooks', '/profile'];
const adminRoutes = ['/admin'];

function Layout() {
  const location = useLocation();

  const showNav =
    memberRoutes.some(r => location.pathname.startsWith(r)) ||
    adminRoutes.some(r => location.pathname.startsWith(r));

  return (
    <>
      <Routes>
        <Route path="/" element={<WelcomeScreen />} />
        <Route path="/login" element={<LoginScreen />} />
        <Route path="/register" element={<RegisterScreen />} />
        <Route path="/books" element={<BookCatalogue />} />
        <Route path="/books/:id" element={<BookDetail />} />
        <Route path="/mybooks" element={<MyBooks />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/admin" element={<AdminHome />} />
        <Route path="/admin/borrowed" element={<BorrowedList />} />
        <Route path="/admin/overdue" element={<OverdueList />} />
        <Route path="/admin/books" element={<BookManagement />} />
        <Route path="/admin/members" element={<MemberManagement />} />
      </Routes>
      {showNav && <BottomNav />}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}