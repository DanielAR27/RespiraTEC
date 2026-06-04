const PDFDocument = require('pdfkit');
const Inscripcion = require('../models/Inscripcion');
const Taller = require('../models/Taller');

const COLOR_PRIMARY = '#243e7b';
const COLOR_ACCENT = '#5cc0b6';
const COLOR_DARK = '#1a2f60';
const COLOR_MUTED = '#888888';
const COLOR_TEXT = '#333333';

const formatearFechaLarga = (fecha) =>
  new Date(fecha).toLocaleDateString('es-CR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

exports.descargarCertificado = async (req, res) => {
  try {
    const { tallerId } = req.params;

    const taller = await Taller.findById(tallerId);
    if (!taller) {
      return res.status(404).json({ success: false, error: 'Taller no encontrado' });
    }

    const inscripcion = await Inscripcion.findOne({
      usuario: req.user.id,
      taller: tallerId
    });

    if (!inscripcion) {
      return res.status(403).json({
        success: false,
        error: 'No estás inscrito en este taller'
      });
    }

    if (new Date() < new Date(taller.fecha_fin)) {
      return res.status(400).json({
        success: false,
        error: 'El taller aún no ha finalizado'
      });
    }

    const nombreUsuario = req.user.nombre || 'Participante';
    const tituloTaller = taller.titulo;
    const instructor = taller.instructor;
    const nivel = taller.nivel;
    const fechaInicio = formatearFechaLarga(taller.fecha_inicio);
    const fechaFin = formatearFechaLarga(taller.fecha_fin);
    const fechaEmision = formatearFechaLarga(new Date());

    const doc = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margin: 0
    });

    const safeFilename = tituloTaller
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-zA-Z0-9]+/g, '_')
      .toLowerCase();

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="certificado_${safeFilename}.pdf"`
    );

    doc.pipe(res);

    const pageWidth = doc.page.width;
    const pageHeight = doc.page.height;

    doc.rect(0, 0, pageWidth, pageHeight).fill('#ffffff');

    doc.rect(0, 0, pageWidth, 12).fill(COLOR_PRIMARY);
    doc.rect(0, pageHeight - 12, pageWidth, 12).fill(COLOR_ACCENT);

    doc
      .lineWidth(3)
      .strokeColor(COLOR_PRIMARY)
      .rect(28, 28, pageWidth - 56, pageHeight - 56)
      .stroke();

    doc
      .fillColor(COLOR_PRIMARY)
      .font('Helvetica-Bold')
      .fontSize(28)
      .text('RespiraTEC', 0, 70, { align: 'center', width: pageWidth, characterSpacing: 6 });

    doc
      .fillColor(COLOR_ACCENT)
      .font('Helvetica')
      .fontSize(11)
      .text('PLATAFORMA ESTUDIANTIL UNIVERSITARIA', 0, 105, {
        align: 'center',
        width: pageWidth,
        characterSpacing: 3
      });

    doc
      .moveTo(pageWidth / 2 - 40, 130)
      .lineTo(pageWidth / 2 + 40, 130)
      .lineWidth(2)
      .strokeColor(COLOR_ACCENT)
      .stroke();

    doc
      .fillColor(COLOR_DARK)
      .font('Helvetica')
      .fontSize(38)
      .text('CERTIFICADO', 0, 155, {
        align: 'center',
        width: pageWidth,
        characterSpacing: 4
      });

    doc
      .fillColor(COLOR_MUTED)
      .font('Helvetica')
      .fontSize(12)
      .text('DE PARTICIPACIÓN', 0, 205, {
        align: 'center',
        width: pageWidth,
        characterSpacing: 3
      });

    doc
      .fillColor('#666666')
      .font('Helvetica-Oblique')
      .fontSize(14)
      .text('Se otorga el presente certificado a', 0, 250, {
        align: 'center',
        width: pageWidth
      });

    doc
      .fillColor(COLOR_PRIMARY)
      .font('Helvetica-Bold')
      .fontSize(38)
      .text(nombreUsuario, 0, 280, { align: 'center', width: pageWidth });

    const nombreY = 280 + doc.heightOfString(nombreUsuario, { width: pageWidth }) + 6;
    doc
      .moveTo(pageWidth / 2 - 180, nombreY)
      .lineTo(pageWidth / 2 + 180, nombreY)
      .lineWidth(1.5)
      .strokeColor(COLOR_ACCENT)
      .stroke();

    doc
      .fillColor('#666666')
      .font('Helvetica-Oblique')
      .fontSize(13)
      .text('por haber completado satisfactoriamente el taller', 0, nombreY + 18, {
        align: 'center',
        width: pageWidth
      });

    doc
      .fillColor(COLOR_PRIMARY)
      .font('Helvetica-Bold')
      .fontSize(22)
      .text(`"${tituloTaller}"`, 0, nombreY + 48, {
        align: 'center',
        width: pageWidth
      });

    const detailsY = pageHeight - 170;
    const colWidth = pageWidth / 3;

    const drawDetail = (label, value, x) => {
      doc
        .fillColor('#aaaaaa')
        .font('Helvetica')
        .fontSize(9)
        .text(label.toUpperCase(), x, detailsY, {
          width: colWidth,
          align: 'center',
          characterSpacing: 2
        });
      doc
        .fillColor(COLOR_TEXT)
        .font('Helvetica-Bold')
        .fontSize(12)
        .text(value, x, detailsY + 16, {
          width: colWidth,
          align: 'center'
        });
    };

    drawDetail('Instructor', instructor, 0);
    drawDetail('Nivel', nivel, colWidth);
    drawDetail('Período', `${fechaInicio} - ${fechaFin}`, colWidth * 2);

    const footerY = pageHeight - 90;
    doc
      .moveTo(60, footerY)
      .lineTo(pageWidth - 60, footerY)
      .lineWidth(1)
      .strokeColor('#e5e7eb')
      .stroke();

    doc
      .moveTo(80, footerY + 40)
      .lineTo(260, footerY + 40)
      .lineWidth(1)
      .strokeColor('#444444')
      .stroke();
    doc
      .fillColor('#666666')
      .font('Helvetica')
      .fontSize(10)
      .text(instructor, 80, footerY + 46, { width: 180, align: 'center' });
    doc
      .fillColor('#666666')
      .fontSize(9)
      .text('Instructor del Taller', 80, footerY + 60, {
        width: 180,
        align: 'center'
      });

    doc
      .fillColor('#aaaaaa')
      .font('Helvetica')
      .fontSize(10)
      .text(`Emitido el ${fechaEmision}`, pageWidth - 280, footerY + 46, {
        width: 200,
        align: 'right'
      });
    doc
      .fillColor('#aaaaaa')
      .fontSize(9)
      .text('RespiraTEC — Plataforma Estudiantil', pageWidth - 280, footerY + 60, {
        width: 200,
        align: 'right'
      });

    doc.end();
  } catch (error) {
    console.error('Error generando certificado:', error);
    if (!res.headersSent) {
      res.status(500).json({ success: false, error: 'Error al generar el certificado' });
    }
  }
};
