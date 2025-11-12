import { getBannerImage } from "../utils/image.utils";

const HeaderLayout = ({ bannerName }: { bannerName: string }) => {
	const bannerImage = getBannerImage(bannerName);
	console.log("Banner Name:", bannerName);
	return <header>{<img src={bannerImage} alt={`${bannerName}`} />}</header>;
};

export default HeaderLayout;
