import React, { CSSProperties, ReactElement } from 'react';


interface BannerProps {
  title: string;
  titleElement?: 'h1' | 'h2' | ReactElement;
  children?: React.ReactNode;
  loading?: boolean;
}

const Banner: React.FC<BannerProps> = ({ title, children, loading }) => {

  let LeftElement: React.ReactNode = <div style={{ width: "75px" }}></div>;
  let RightElement: React.ReactNode = <div style={{ width: "75px" }}></div>;

  // Check if children prop is defined
  if (children) {
    // Handle single child or multiple children scenario
    if (React.Children.count(children) === 1) {
      // Only one child provided
      LeftElement = children;
    } else if (React.Children.count(children) === 2) {
      // Two children provided
      LeftElement = React.Children.toArray(children)[0];
      RightElement = React.Children.toArray(children)[1];
    }
  }
  const headerStyle: CSSProperties = {}
  if (loading) headerStyle.color = "yellow";

  return (
    <div className="banner">
      {LeftElement}
      <h1 style={headerStyle}>{title}</h1>
      {RightElement}
    </div>
  );
}

export default Banner;
