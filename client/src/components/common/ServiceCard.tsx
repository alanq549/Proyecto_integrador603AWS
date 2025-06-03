// src/components/ServiceCard.tsx
type ServiceCardProps = {
    icon: string;
    title: string;
    description: string;
    onClick: () => void;
  };
  
  const ServiceCard = ({ icon, title, description, onClick }: ServiceCardProps) => {
    return (
      <div className="service-card cursor-pointer" onClick={onClick}>
        <div className="icon text-4xl">{icon}</div>
        <h3 className="text-white">{title}</h3>
        <p className="text-gray-100">{description}</p>
      </div>
    );
  };
  
  export default ServiceCard;