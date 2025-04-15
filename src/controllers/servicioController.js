import Servicio from "../models/Servicio.js";

export const obtenerServicios = async (req, res) => {
  try {
    const servicios = await Servicio.aggregate([
      {
        $group: {
          _id: "$categoria",
          servicios: {
            $push: {
              nombre: "$nombre",
              precio: "$precio",
              duracion: "$duracion",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          k: "$_id",
          v: "$servicios",
        },
      },
      {
        $group: {
          _id: null,
          root: { $push: { k: "$k", v: "$v" } },
        },
      },
      {
        $replaceRoot: {
          newRoot: { $arrayToObject: "$root" },
        },
      },
    ]);

    res.status(200).json(servicios[0]);
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error });
  }
};

export const obtenerServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await Servicio.findById(id);
    if (!servicio)
      return res.status(404).json({ mensaje: "Servicio no encontrado" });
    res.status(200).json(servicio);
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error });
  }
};

export const crearServicio = async (req, res) => {
  try {
    const { categoria, nombre, duracion, precio } = req.body;
    let servicioExistente = await Servicio.findOne({ categoria, nombre });

    if (servicioExistente)
      return res.status(400).json({ mensaje: "El servicio ya existe" });

    const servicio = new Servicio({ categoria, nombre, duracion, precio });
    await servicio.save();
    res.status(201).json({ mensaje: "Servicio creado con éxito", servicio });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error });
  }
};

export const actualizarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, duracion, precio } = req.body;
    const servicio = await Servicio.findByIdAndUpdate(
      id,
      { nombre, duracion, precio },
      { new: true }
    );
    if (!servicio)
      return res.status(404).json({ mensaje: "Servicio no encontrado" });
    res
      .status(200)
      .json({ mensaje: "Servicio actualizado con éxito", servicio });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error });
  }
};

export const eliminarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await Servicio.findByIdAndDelete(id);
    if (!servicio)
      return res.status(404).json({ mensaje: "Servicio no encontrado" });
    res.status(200).json({ mensaje: "Servicio eliminado con éxito", servicio });
  } catch (error) {
    res.status(500).json({ mensaje: "Error en el servidor", error });
  }
};
