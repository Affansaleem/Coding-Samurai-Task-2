import Footer from "../components/Footer";
import Header from "../components/Header";
import Main from "../components/Main";

function AppLayout() {
  return (
    <div className="bg-stone-800 min-h-screen flex flex-col">
      <Header />
      <Main />
      <Footer />
    </div>
  );
}

export default AppLayout;
