import Header from "../../Components/Header/Header";

export default function HeaderOnlyLayout({ children }) {
  return (
    <div className="flex flex-col min-h-screen bg-[#F5F7F9]">
      <Header />
      <main className="flex-1 p-4">{children}</main>
    </div>
  );
}
