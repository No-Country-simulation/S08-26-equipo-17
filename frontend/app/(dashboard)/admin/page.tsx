import { HeaderNameAddress } from '@/app/components/HeaderNameAddress';
import { HomeBanner } from '@/app/components/HomeBanner';

const page = () => {
  return (
    <div className="grid gap-10">
      <HeaderNameAddress
        name="Felipe"
        building="Edificio Araoz 1280 - Unidad 7D"
      ></HeaderNameAddress>
      <></>
      <HomeBanner imageUrl="/edificio-Kavanagh.jpg" />
    </div>
  );
};

export default page;
