// src/pages/Home.tsx
import { useEffect, useRef, useState } from "react";
import "../styles/home.css"; // Asegúrate de tener tu CSS aquí
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Modal from "../components/common/Modal";
import "../pages/Login";
import { Link } from "react-router-dom";
import "animate.css";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import RotatingText from "../components/common/TextAnimations/RotatingText";
gsap.registerPlugin(ScrollTrigger);
/// import images
import expressImg from "../assets/service_express.png";
import basicoImg from "../assets/service_basico.png";
import mantenimientoImg from "../assets/mantenimientoImg.png";
import premiumImg from "../assets/service_premium.png";
import parkingImg from "../assets/service_parking.png";
import tipoVehiculoImg from "../assets/tipoVehiculoImg.png";

const Home = () => {
  const [scrollingUp, setScrollingUp] = useState(true); // Estado para saber si estamos subiendo o bajando
  const [lastScrollY, setLastScrollY] = useState(0); // Para guardar la última posición de scroll
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const sectionRef = useRef<HTMLDivElement | null>(null); // Referencia a la sección que queremos animar


  const openModal = (modalName: string) => {
    setActiveModal(modalName);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const handleScroll = () => {
    if (window.scrollY > lastScrollY) {
      // Si estamos bajando, ocultamos el nav
      setScrollingUp(false);
    } else {
      // Si estamos subiendo, mostramos el nav
      setScrollingUp(true);
    }
    setLastScrollY(window.scrollY); // Actualizamos la última posición de scroll
  };

  /// para las imagenes de los servicios
  const services = [
    {
      id: "tipoVehiculo",
      title: "Tipo de Vehículo",
      image: tipoVehiculoImg, // la imagen que uses
      details:
        "Selecciona el tipo de vehículo: sedán, SUV, camioneta o motocicleta. Cada uno cuenta con servicios adaptados a su tamaño y necesidades específicas.",
    },
    {
      id: "parking",
      title: "Estacionamiento 24/7",
      image: parkingImg,
      details:
        "Vigilancia continua, acceso seguro y amplio espacio. Acceso con cámaras, sistema automatizado, y servicio mensual disponible.",
    },
    {
      id: "expres",
      title: "Autolavado exprés",
      image: expressImg,
      details:
        "Limpieza profesional en menos de 30 minutos. Incluye lavado exterior rápido, secado a mano y limpieza de cristales.",
    },
    {
      id: "basico",
      title: "Lavado básico",
      image: basicoImg,
      details:
        "Lavado exterior e interior con productos de calidad. Aspirado interior, aplicación de aromatizante. Tiempo estimado: 15 min.",
    },
    {
      id: "premium",
      title: "Lavado Premium",
      image: premiumImg,
      details:
        "Incluye encerado, limpieza profunda de interiores y aromatizante. Duración estimada: 30 min.",
    },
    {
      id: "mantenimiento",
      title: "Mantenimiento Rápido",
      image: mantenimientoImg,
      details: [
        "Cubiertas y accesorios",
        "Lubricentro",
        "Cambio de aceite",
        "Alineación y balanceo de neumáticos",
      ],
      description:
        "Ofrecemos servicios complementarios para tu comodidad y el cuidado completo de tu auto. Todo en un solo lugar y sin necesidad de cita previa.",
    },
  ];

  useEffect(() => {
    // Agregamos el listener de scroll
    window.addEventListener("scroll", handleScroll);

    // Limpiamos el listener cuando el componente se desmonte
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lastScrollY]); // Dependemos de lastScrollY para que el hook se ejecute

  /// Animaciones con GSAP
  useEffect(() => {
    // Si no es escritorio, no hacemos nada
    if (window.innerWidth < 1024) return;

    if (!sectionRef.current) return;

    const element = sectionRef.current;

    const animation = gsap.to(element, {
      scrollTrigger: {
        trigger: element,
        start: "top 85%",
        end: "top 1%",
        scrub: false,
        markers: false,

        onEnter: () => {
          element.classList.remove("animate__zoomOut");
          element.classList.add("animate__animated", "animate__zoomIn");
        },

        onLeave: () => {
          element.classList.remove("animate__zoomIn");
          element.classList.add("animate__animated", "animate__zoomOut");
        },

        onEnterBack: () => {
          element.classList.remove("animate__zoomOut");
          element.classList.add("animate__animated", "animate__zoomIn");
        },

        onLeaveBack: () => {
          element.classList.remove("animate__zoomIn");
          element.classList.add("animate__animated", "animate__zoomOut");
        },
      },
    });

    // Cleanup para evitar fugas de memoria
    return () => {
      animation.scrollTrigger?.kill();
    };
  }, []);

  return (
    <div className="home-container">
      {/* NavBar */}
      
      <header className={`navbar ${!scrollingUp ? "hidden" : ""}`}>
        <nav className="nav-container">
          <div className="brand-logo flex items-center space-x-3">
            <img className="logo" src="log.png" alt="icon" />
            <h1 className="brand">Martinez</h1>
          </div>

          <div className="nav-links">
            <Link to="/login" className="nav-btn group">
              <span>Iniciar Sesión</span>
            </Link>
            <Link to="/register" className="nav-btn group">
              <span>Registrarse</span>
            </Link>
          </div>
        </nav>
      </header>
      {/* Hero */}
      <section className="hero">
        <div className="hero-overlay">
          <div className="hero-text">
            <h1 className="title ">Estacionamiento & Autolavado</h1>
          </div>
          <p className="subtitle">
            <RotatingText
              texts={[
                "El combo perfecto",
                "Lava, estaciona y relájate.",
                "Menos estrés, más tiempo para ti.",
              ]}
              mainClassName="px-2 sm:px-2 md:px-3 bg-gradient-to-r from-cyan-500 to-cyan-300 text-black font-bold overflow-hidden py-1 sm:py-2 md:py-3 justify-center rounded-lg min-h-[2.5rem] flex items-center"
              staggerFrom="last"
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-120%" }}
              staggerDuration={0.03}
              splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
              transition={{ type: "spring", damping: 20, stiffness: 200 }}
              rotationInterval={3500}
            />
          </p>
        </div>
      </section>
      {/* Sección de Acerca de Nosotros */}
      <section className="about about-section">
        <h3 className="section-title">Sobre Nosotros</h3>
        <p>
          ¡Bienvenido a Estacionamiento & Autolavado Martinez! Somos un
          establecimiento especializado que combina servicios de estacionamiento
          seguro con lavado profesional de vehículos, fundado en 2023 con el
          objetivo de revolucionar el cuidado automotriz.
        </p>
        <p>
          Nuestro innovador concepto ofrece a los clientes la comodidad de dejar
          su vehículo estacionado mientras recibe un lavado premium con los más
          altos estándares de calidad. Utilizamos tecnología moderna y productos
          profesionales para garantizar resultados impecables.
        </p>
        <p>
          Lo que nos diferencia:
          <ul>
            <li>
              Personal capacitado en técnicas de lavado ecológico y seguro
            </li>
            <li>Instalaciones diseñadas para la protección de su vehículo</li>
            <li>
              Sistema combinado que ahorra tiempo y ofrece máxima comodidad
            </li>
            <li>Compromiso con la satisfacción total del cliente</li>
          </ul>
        </p>
        <p>
          En Estacionamiento & Autolavado Martinez no solo cuidamos de tu auto,
          sino también de tu tiempo. ¡Nuestra prioridad es ofrecerte una
          experiencia excepcional!
        </p>
      </section>
      <a
        href="https://wa.me/numero_empresa"
        className="floating-whatsapp"
        target="_blank"
      >
        💬
      </a>

      {/* Servicios */}
      <section className="services-section">
        <h2 className="section-title">Servicios que ofrecemos</h2>
        <div className="services-grid">
          {services.map((service) => (
            <div
              key={service.id}
              className="cursor-pointer hover:scale-105 transition-transform duration-300"
              onClick={() =>
                service.id === "parking"
                  ? (window.location.href = "#ubicacion")
                  : openModal(service.id)
              }
            >
              <img
                src={service.image}
                alt={service.title}
                className="rounded-lg shadow-lg w-full h-[500px] object-cover hover:brightness-105 transition duration-300"
              />
            </div>
          ))}
        </div>

        {/* Modal */}
        <Modal isOpen={activeModal !== null} onClose={closeModal}>
          {activeModal &&
            (() => {
              const service = services.find(
                (service) => service.id === activeModal
              );
              if (!service) return null;

              return (
                <div>
                  <img
                    src={service.image}
                    alt={service.title}
                    className="rounded mb-4 w-full h-[500px]"
                  />
                  <h3 className="text-2xl font-bold mb-2">{service.title}</h3>

                  {/* Mostrar texto si es string */}
                  {typeof service.details === "string" ? (
                    <p className="text-gray-700 whitespace-pre-line">
                      {service.details}
                    </p>
                  ) : (
                    // Mostrar lista si es array
                    <ul className="list-disc list-inside text-gray-700 space-y-1 justify-content: start;">
                      {service.details.map((item: string, index: number) => (
                        <li className="justify-content: start;" key={index}>
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })()}
        </Modal>
      </section>

      {/* Ubicación */}
      <section className="location-section">
        <h2 className="section-title">¿Dónde estamos?</h2>
        <p className="location-text">
          📍 Av. Tecnológica #123, Ciudad Futuro, México.
        </p>
        <div className="map-container">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3756.286718146039!2d-100.06575632531967!3d19.70041363207461!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d2f31d937a046d%3A0x519b02931c424d4c!2sIglesia%20de%20Rioyos%20Buenavista!5e0!3m2!1ses-419!2smx!4v1744497489655!5m2!1ses-419!2smx"
            allowFullScreen
            loading="lazy"
            id="map"
          ></iframe>
          jnjknknk
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15017.254286378837!2d-99.90344230383022!3d19.784297921799556!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d258a8f8749989%3A0x8cf27645cc30875e!2sAutotransportes%20Leo%20SA%20de%20CV!5e0!3m2!1ses-419!2smx!4v1745361115286!5m2!1ses-419!2smx" width="600" height="450"  loading="lazy" ></iframe>
        </div>
      </section>

      {/* Reseñas */}
      <section className="reviews-section">
        <h2 className="section-title">Lo que dicen nuestros clientes</h2>
        <Slider className="slider">
          <div>
            <blockquote className="review-card">
              <div className="review-header">
                <img
                  src="/assets/avatar1.jpg"
                  alt="Mariana"
                  className="avatar"
                />
                <div>
                  <p className="review-name">Mariana G.</p>
                  <p className="review-stars">⭐⭐⭐⭐⭐</p>
                </div>
              </div>
              <p>
                “Excelente servicio y atención. Siempre dejo mi coche con
                confianza.”
              </p>
            </blockquote>
          </div>
          <div>
            <blockquote className="review-card">
              <div className="review-header">
                <img src="/assets/avatar2.jpg" alt="Luis" className="avatar" />
                <div>
                  <p className="review-name">Luis T.</p>
                  <p className="review-stars">⭐⭐⭐⭐⭐</p>
                </div>
              </div>
              <p>“El autolavado premium deja mi carro como nuevo. 10/10.”</p>
            </blockquote>
          </div>
        </Slider>
      </section>

      {/* cita */}
      <section className="cta-section">
        <h2>¿Listo para una experiencia sin complicaciones?</h2>
        <p>Reserva tu lugar y deja que nosotros nos encarguemos del resto.</p>
        <Link to="/login" className="cta-btn">
          Reservar ahora
        </Link>
      </section>

      {/* footer */}
      <footer className="footer">
        <div className="social-icons">
          <a href="#" className="social-icon">
            Facebook
          </a>
          <a href="#" className="social-icon">
            Instagram
          </a>
          <a href="#" className="social-icon">
            Twitter
          </a>
        </div>
        <div className="footer-section">
          <h4>Horario</h4>
          <p>Lunes a Viernes: 8:00 - 20:00</p>
          <p>Sábado y Domingo: 9:00 - 18:00</p>
        </div>
        <div className="footer-bottom">
          <p>
            &copy; {new Date().getFullYear()} Estacionamiento Martinez. Todos
            los derechos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};
export default Home;
