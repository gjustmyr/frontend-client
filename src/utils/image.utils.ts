import alumniBanner from "../assets/images/banners/alumni-banner.png";
import mainBanner from "../assets/images/banners/main-banner.png";
import companyRepresentativeBanner from "../assets/images/banners/company-representative-banner.png";
import jobPlacementBanner from "../assets/images/banners/job-placement-banner.png";
import ojtHeadBanner from "../assets/images/banners/ojt-head-banner.png";
import ojtCoordinatorBanner from "../assets/images/banners/ojt-coordinator-banner.png";
import studentTraineeBanner from "../assets/images/banners/student-trainee-banner.png";
import superAdminBanner from "../assets/images/banners/super-admin-banner.png";
import trainingSupervisorBanner from "../assets/images/banners/training-supervisor-banner.png";
import logo from "../assets/images/logos/logo.png";

const getBannerImage = (name: string): string => {
	switch (name) {
		case "alumni":
			return alumniBanner;
		case "company-representative":
			return companyRepresentativeBanner;
		case "job-placement":
			return jobPlacementBanner;
		case "ojt-head":
			return ojtHeadBanner;
		case "ojt-coordinator":
			return ojtCoordinatorBanner;
		case "student-trainee":
			return studentTraineeBanner;
		case "super-admin":
			return superAdminBanner;
		case "training-supervisor":
			return trainingSupervisorBanner;
		default:
			return mainBanner;
	}
};

export { logo, getBannerImage };
