### Docker Command

```shell
docker ps --format "table {{.ID}}\t{{.RunningFor}}\t{{.Names}}\t{{.Mounts}}"
```

### Close Salt

```shell
sudo systemctl stop putwall_gui.service
```

### Radial Command

```shell

/var/covariant/app/data/radial-wms-ftp-mock/admin

sudo rm /var/covariant/app/state/practice_batch/* -rf

ALLOW_UNCOMMITTED_CHANGES=True ./putwall.sh u_shape/radial/szx_02 api up -m practice_batch
ALLOW_UNCOMMITTED_CHANGES=True ./putwall.sh u_shape/radial/szx_02 api down -m practice_batch

./putwall.sh u_shape/radial/szx_02 gui up
./putwall.sh u_shape/radial/szx_02 gui down

```

### Geodis Command

```shell
/var/covariant/app/data/radial-wms-ftp-mock/admin

sudo rm /var/covariant/app/state/practice_batch/* -rf

ALLOW_UNCOMMITTED_CHANGES=True ./putwall.sh u_shape/geodis/szx_01 api up -m practice_batch
ALLOW_UNCOMMITTED_CHANGES=True ./putwall.sh u_shape/geodis/szx_01 api down -m practice_batch

./putwall.sh u_shape/geodis/szx_01 gui up
./putwall.sh u_shape/geodis/szx_01 gui down

```
