from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('core', '0004_depoturismoitem'),
    ]

    operations = [
        migrations.CreateModel(
            name='ArquitecturaDeportiva',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('titulo', models.CharField(max_length=200)),
                ('descripcion', models.TextField(blank=True)),
                ('imagen', models.ImageField(blank=True, null=True, upload_to='arquitectura/')),
                ('video_url', models.URLField(blank=True, null=True)),
                ('tipo', models.CharField(default='foto', max_length=10)),
                ('orden', models.PositiveIntegerField(default=0)),
                ('creado', models.DateTimeField(auto_now_add=True)),
            ],
            options={
                'ordering': ['-creado'],
            },
        ),
    ]