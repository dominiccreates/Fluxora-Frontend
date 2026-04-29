import GetStartedCTA from "../components/GetStartedCTA";
import Footer from "../components/Footer";

export default function Home() {
  return (
    <div
      style={{
        backgroundColor: "var(--bg)",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <main 
        id="main-content"
        style={{ 
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
        }}
      >
        <div style={{ width: "100%", maxWidth: "800px" }}>
          <GetStartedCTA />
        </div>
      </main>
      <Footer />
    </div>
  );
}
