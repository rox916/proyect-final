import { Link } from "react-router-dom";

function Home() {
  return (
    <>
      {/* Hero Section */}
      <div className="tm-hero d-flex justify-content-center align-items-center tm-hero--bg">
        <form
          className="d-flex tm-search-form"
          onSubmit={(e) => e.preventDefault()}
        >
          <input
            className="form-control tm-search-input"
            type="search"
            placeholder="Buscar"
            aria-label="Buscar"
          />
          <button
            className="btn btn-outline-success tm-search-btn"
            type="submit"
          >
            <i className="fas fa-search"></i>
          </button>
        </form>
      </div>

      {/* Gallery Section */}
      <div className="container-fluid tm-container-content tm-mt-60">
        <div className="row mb-4">
          <h2 className="col-6 tm-text-primary">Últimas Señales</h2>
          <div className="col-6 d-flex justify-content-end align-items-center">
            <form action="" className="tm-text-primary">
              Página{" "}
              <input
                type="text"
                defaultValue="1"
                size="1"
                className="tm-input-paging tm-text-primary"
              />{" "}
              de 200
            </form>
          </div>
        </div>

        {/* Gallery grid */}
        <div className="row tm-mb-90 tm-gallery">
          {[
            { src: "/img/img-03.jpg", title: "Vocales", date: "18 Oct 2020", views: "9,906", link: "/vocales" },
            { src: "/img/img-04.jpg", title: "Algoritmos", date: "14 Oct 2020", views: "16,100", link: "/algoritmos" },
            { src: "/img/img-05.jpg", title: "Morning", date: "12 Oct 2020", views: "12,460", link: "#" },
            { src: "/img/img-06.jpg", title: "Pinky", date: "10 Oct 2020", views: "11,402", link: "#" },
            { src: "/img/img-01.jpg", title: "Hangers", date: "24 Sep 2020", views: "16,008", link: "#" },
            { src: "/img/img-02.jpg", title: "Perfumes", date: "20 Sep 2020", views: "12,860", link: "#" },
            { src: "/img/img-07.jpg", title: "Bus", date: "16 Sep 2020", views: "10,900", link: "#" },
            { src: "/img/img-08.jpg", title: "New York", date: "12 Sep 2020", views: "11,300", link: "#" },
          ].map((item, index) => (
            <div key={index} className="col-xl-3 col-lg-4 col-md-6 col-sm-6 col-12 mb-5">
              <figure className="effect-ming tm-video-item">
                <img src={item.src} alt={item.title} className="img-fluid" />
                <figcaption className="d-flex align-items-center justify-content-center">
                  <h2>{item.title}</h2>
                  <Link to={item.link}>Ver más</Link>
                </figcaption>
              </figure>
              <div className="d-flex justify-content-between tm-text-gray">
                <span className="tm-text-gray-light">{item.date}</span>
                <span>{item.views} vistas</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="row tm-mb-90">
          <div className="col-12 d-flex justify-content-between align-items-center tm-paging-col">
            <a href="#!" className="btn btn-primary tm-btn-prev mb-2 disabled">
              Anterior
            </a>
            <div className="tm-paging d-flex">
              <a href="#!" className="active tm-paging-link">1</a>
              <a href="#!" className="tm-paging-link">2</a>
              <a href="#!" className="tm-paging-link">3</a>
              <a href="#!" className="tm-paging-link">4</a>
            </div>
            <a href="#!" className="btn btn-primary tm-btn-next">Siguiente</a>
          </div>
        </div>
      </div>
    </>
  );
}

export default Home;
