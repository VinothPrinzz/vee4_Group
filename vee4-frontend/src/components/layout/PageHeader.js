// src/components/layout/PageHeader.js
import React from 'react';
import PropTypes from 'prop-types';

const PageHeader = ({ title, subtitle }) => {
  return (
    <div className="page-header">
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>
  );
};

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string
};

export default PageHeader;