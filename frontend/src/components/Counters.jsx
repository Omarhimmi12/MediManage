const Counters = ({ counters }) => {
  return (
    <section className="py-5 text-center bg-light">
      <div className="container">
        <div className="row">
          <div className="col-md-4" data-aos="fade-up">
            <h2 className="text-primary fw-bold">{counters.doctors}+</h2>
            <p>Doctors Using Platform</p>
          </div>

          <div className="col-md-4" data-aos="fade-up" data-aos-delay="200">
            <h2 className="text-primary fw-bold">{counters.patients}+</h2>
            <p>Patients Managed</p>
          </div>

          <div className="col-md-4" data-aos="fade-up" data-aos-delay="400">
            <h2 className="text-primary fw-bold">{counters.appointments}+</h2>
            <p>Appointments Scheduled</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Counters;